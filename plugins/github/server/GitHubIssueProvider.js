"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitHubIssueProvider = void 0;
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _models = require("../../../server/models");
var _database = require("../../../server/storage/database");
var _BaseIssueProvider = require("../../../server/utils/BaseIssueProvider");
var _github = require("./github");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// This is needed to handle Octokit paginate response type mismatch.

class GitHubIssueProvider extends _BaseIssueProvider.BaseIssueProvider {
  constructor() {
    super(_types.IntegrationService.GitHub);
  }
  async fetchSources(integration) {
    const client = await _github.GitHub.authenticateAsInstallation(integration.settings.github.installation.id);
    const sources = [];
    for await (const response of client.requestRepos()) {
      const repos = response.data;
      sources.push(...repos.map(repo => ({
        id: String(repo.id),
        name: repo.name,
        owner: {
          id: String(repo.owner.id),
          name: repo.owner.login
        },
        service: _types.IntegrationService.GitHub
      })));
    }
    return sources;
  }
  async handleWebhook(_ref) {
    let {
      payload,
      headers
    } = _ref;
    const hookId = headers["x-github-hook-id"];
    const eventName = headers["x-github-event"];
    const action = payload.action;
    if (!eventName || !action) {
      _Logger.default.warn(`Received GitHub webhook without event name or action; hookId: ${hookId}, eventName: ${eventName}, action: ${action}`);
      return;
    }
    switch (eventName) {
      case "installation":
        {
          await this.handleInstallationEvent(payload, action);
          break;
        }
      case "installation_repositories":
        {
          await this.handleInstallationRepositoriesEvent(payload);
          break;
        }
      case "repository":
        {
          await this.handleRepositoryEvent(payload, action, hookId);
          break;
        }
      default:
    }
  }
  async handleInstallationEvent(payload, action) {
    if (action !== "new_permissions_accepted") {
      return;
    }
    const event = payload;
    const installationId = event.installation.id;
    const integration = await _models.Integration.findOne({
      where: {
        service: _types.IntegrationService.GitHub,
        "settings.github.installation.id": installationId
      }
    });
    if (!integration) {
      _Logger.default.warn(`GitHub installation new_permissions_accepted event without integration; installationId: ${installationId}`);
      return;
    }
    const sources = await this.fetchSources(integration);
    const client = await _github.GitHub.authenticateAsInstallation(installationId);
    const installation = await client.requestAppInstallation(installationId);
    const scopes = Object.entries(installation.data.permissions).map(_ref2 => {
      let [name, permission] = _ref2;
      return `${name}:${String(permission)}`;
    });
    await _database.sequelize.transaction(async transaction => {
      await integration.reload({
        include: {
          model: _models.IntegrationAuthentication,
          as: "authentication",
          required: true
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const authentication = integration.authentication;
      if (!authentication) {
        _Logger.default.warn(`GitHub integration without authentication; integrationId: ${integration.id}`);
        return;
      }
      authentication.scopes = scopes;
      await authentication.save({
        transaction
      });
      integration.issueSources = sources;
      integration.changed("issueSources", true);
      await integration.save({
        transaction
      });
    });
  }
  async handleInstallationRepositoriesEvent(event) {
    const installationId = event.installation.id;
    const account = event.installation.account;
    await _database.sequelize.transaction(async transaction => {
      const integration = await _models.Integration.findOne({
        where: {
          service: _types.IntegrationService.GitHub,
          "settings.github.installation.id": installationId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!integration) {
        _Logger.default.warn(`GitHub installation_repositories event without integration; installationId: ${installationId}`);
        return;
      }
      let sources = integration.issueSources ?? [];
      if (event.action === "added") {
        const addedSources = event.repositories_added.map(repo => ({
          id: String(repo.id),
          name: repo.name,
          owner: {
            id: String(account.id),
            name: account.login
          },
          service: _types.IntegrationService.GitHub
        }));
        sources.push(...addedSources);
      } else {
        const removedSourceIds = event.repositories_removed.map(repo => String(repo.id));
        sources = sources.filter(source => !removedSourceIds.includes(source.id));
      }
      integration.issueSources = sources;
      integration.changed("issueSources", true);
      await integration.save({
        transaction
      });
    });
  }
  async handleRepositoryEvent(payload, action, hookId) {
    if (action !== "renamed") {
      return;
    }
    const event = payload;
    const installationId = event.installation?.id;
    if (!installationId) {
      _Logger.default.warn(`GitHub repository renamed event without installation ID; hookId: ${hookId}`);
      return;
    }
    const repoId = event.repository.id;
    const repoName = event.repository.name;
    await _database.sequelize.transaction(async transaction => {
      const integration = await _models.Integration.findOne({
        where: {
          service: _types.IntegrationService.GitHub,
          "settings.github.installation.id": installationId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!integration) {
        _Logger.default.warn(`GitHub repository renamed event without integration; installationId: ${installationId}`);
        return;
      }
      const source = integration.issueSources?.find(s => s.id === String(repoId));
      if (!source) {
        _Logger.default.info("task", `No matching issue source found for repository ID: ${repoId}, integration ID: ${integration.id}`);
        return;
      }
      source.name = repoName;
      integration.changed("issueSources", true);
      await integration.save({
        transaction
      });
    });
  }
}
exports.GitHubIssueProvider = GitHubIssueProvider;