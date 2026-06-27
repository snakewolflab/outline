"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitLabIssueProvider = void 0;
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _models = require("../../../server/models");
var _BaseIssueProvider = require("../../../server/utils/BaseIssueProvider");
var _gitlab = require("./gitlab");
var _database = require("../../../server/storage/database");
var _sequelize = require("sequelize");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GitLabIssueProvider extends _BaseIssueProvider.BaseIssueProvider {
  constructor() {
    super(_types.IntegrationService.GitLab);
  }
  async fetchSources(integration) {
    await integration.reload({
      include: [{
        model: _models.IntegrationAuthentication,
        as: "authentication",
        required: true
      }]
    });
    if (!integration.authentication) {
      _Logger.default.warn("GitLab integration without authentication");
      return [];
    }
    const sources = [];
    try {
      const projects = await _gitlab.GitLab.getProjects({
        accessToken: integration.authentication.token,
        teamId: integration.teamId
      });
      sources.push(...projects.map(project => ({
        id: String(project.id),
        name: project.name,
        owner: {
          id: String(project.namespace.id),
          name: project.namespace.full_path
        },
        service: _types.IntegrationService.GitLab
      })));
    } catch (err) {
      _Logger.default.warn("Failed to fetch projects from GitLab", (0, _error.toError)(err));
    }
    return sources;
  }
  async handleWebhook(_ref) {
    let {
      payload,
      headers
    } = _ref;
    const hookId = headers["x-gitlab-webhook-uuid"];
    const typedPayload = payload;
    const eventName = typedPayload.event_name;
    if (!eventName) {
      _Logger.default.warn(`Received GitLab webhook without event name; hookId: ${hookId}, eventName: ${eventName}`);
      return;
    }
    switch (eventName) {
      case "project_update":
      case "project_transfer":
      case "project_rename":
        await this.updateProject(typedPayload);
        break;
      case "repository_update":
        await this.createProject(typedPayload);
        break;
      case "project_destroy":
        await this.destroyProject(typedPayload);
        break;
      case "group_rename":
      case "user_rename":
        await this.updateNamespace(typedPayload);
        break;
      case "user_destroy":
      case "group_destroy":
        await this.destroyNamespace(typedPayload);
        break;
      default:
        break;
    }
  }
  async updateNamespace(payload) {
    const name = payload.old_full_path ?? payload.old_username;
    const where = {
      service: _types.IntegrationService.GitLab,
      [_sequelize.Op.and]: _database.sequelize.literal(`"issueSources"::jsonb @> :jsonCondition`)
    };
    const jsonCondition = JSON.stringify([{
      owner: {
        name
      }
    }]);
    await _database.sequelize.transaction(async transaction => {
      const integration = await _models.Integration.findOne({
        where,
        replacements: {
          jsonCondition
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      if (!integration) {
        _Logger.default.warn(`GitLab namespace_update event without integration;`);
        return;
      }
      const newName = payload.full_path ?? payload.username;
      if (!newName) {
        _Logger.default.warn(`GitLab namespace_update event without new name`);
        return;
      }
      const sources = integration.issueSources ?? [];
      const updatedSources = sources.map(source => {
        if (source.owner.name === name) {
          return {
            ...source,
            owner: {
              id: payload.group_id || source.owner.id,
              name: newName
            }
          };
        }
        return source;
      });
      integration.issueSources = updatedSources;
      integration.changed("issueSources", true);
      await integration.save({
        transaction
      });
    });
  }
  async destroyNamespace(payload) {
    if (!payload.user_id && !payload.full_path) {
      _Logger.default.warn(`GitLab namespace_destroy event without user_id or full_path`);
      return;
    }
    let replacements = {};
    const whereCondition = {
      service: _types.IntegrationService.GitLab,
      ...(payload.user_id && {
        "settings.gitlab.installation.account.id": payload.user_id
      }),
      ...(!payload.user_id && payload.full_path && {
        [_sequelize.Op.and]: _database.sequelize.literal(`"issueSources"::jsonb @> :jsonCondition`)
      })
    };
    if (!payload.user_id && payload.full_path) {
      replacements = {
        jsonCondition: JSON.stringify([{
          owner: {
            name: payload.full_path
          }
        }])
      };
    }
    await _database.sequelize.transaction(async transaction => {
      const integrations = await _models.Integration.findAll({
        where: whereCondition,
        replacements,
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      if (!integrations.length) {
        _Logger.default.warn(`GitLab namespace_destroy event without integration;`);
        return;
      }
      for (const integration of integrations) {
        if (payload.full_path) {
          const sources = integration.issueSources?.filter(source => payload.full_path !== source.owner.name) ?? [];
          integration.issueSources = sources;
          integration.changed("issueSources", true);
          await integration.save({
            transaction
          });
        } else if (payload.user_id) {
          await integration.destroy();
        }
      }
    });
  }
  async destroyProject(payload) {
    await _database.sequelize.transaction(async transaction => {
      const integrations = await _models.Integration.findAll({
        where: {
          service: _types.IntegrationService.GitLab,
          [_sequelize.Op.and]: _database.sequelize.where(_database.sequelize.literal(`"issueSources"::jsonb @> :projectJson`), _sequelize.Op.eq, true)
        },
        replacements: {
          projectJson: JSON.stringify([{
            id: String(payload.project_id)
          }])
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      if (!integrations.length) {
        _Logger.default.warn(`GitLab project_destroy event without integration;`);
        return;
      }
      for (const integration of integrations) {
        const sources = integration.issueSources?.filter(source => String(payload.project_id) !== source.id) ?? [];
        integration.issueSources = sources;
        integration.changed("issueSources", true);
        await integration.save({
          transaction
        });
      }
    });
  }
  async createProject(payload) {
    const createEvent = payload.changes?.some(p => /^0{40}$/.test(p.before));
    if (!createEvent) {
      return;
    }
    const project = payload.project;
    if (!project || !payload.project_id) {
      return;
    }
    await _database.sequelize.transaction(async transaction => {
      const integration = await _models.Integration.findOne({
        where: {
          service: _types.IntegrationService.GitLab,
          "settings.gitlab.installation.account.id": payload.user_id
        },
        lock: transaction.LOCK.UPDATE
      });
      if (!integration) {
        _Logger.default.warn(`GitLab project_create event without integration;`);
        return;
      }
      const owner = {
        id: "",
        // namespace.id is not provided in this webhook payload
        name: project.path_with_namespace.split("/").slice(0, -1).join("/")
      };
      const sources = integration.issueSources ?? [];
      sources.push({
        id: String(payload.project_id),
        name: project.name,
        service: _types.IntegrationService.GitLab,
        owner
      });
      integration.issueSources = sources;
      integration.changed("issueSources", true);
      await integration.save({
        transaction
      });
    });
  }
  async updateProject(payload) {
    if (!payload.name || !payload.path_with_namespace) {
      return;
    }
    const newName = payload.name;
    const pathWithNamespace = payload.path_with_namespace;
    await _database.sequelize.transaction(async transaction => {
      const integrations = await _models.Integration.findAll({
        where: {
          service: _types.IntegrationService.GitLab,
          [_sequelize.Op.and]: _database.sequelize.where(_database.sequelize.literal(`"issueSources"::jsonb @> :projectJson`), _sequelize.Op.eq, true)
        },
        replacements: {
          projectJson: JSON.stringify([{
            id: String(payload.project_id)
          }])
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      if (!integrations.length) {
        _Logger.default.warn(`GitLab project_update event without integration;`);
        return;
      }
      for (const integration of integrations) {
        const source = integration.issueSources?.find(s => s.id === String(payload.project_id));
        if (source) {
          source.name = newName;
          source.owner.name = pathWithNamespace.split("/").slice(0, -1).join("/");
          source.owner.id = String(payload.project_namespace_id);
          integration.changed("issueSources", true);
          await integration.save({
            transaction
          });
        }
      }
    });
  }
}
exports.GitLabIssueProvider = GitLabIssueProvider;