"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Linear = void 0;
var _sdk = require("@linear/sdk");
var _error = require("../../../shared/utils/error");
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _models = require("../../../server/models");
var _LinearUtils = require("../shared/LinearUtils");
var _env = _interopRequireDefault(require("./env"));
var _time = require("../../../shared/utils/time");
var _i18n = require("../../../server/utils/i18n");
var _i18next = require("i18next");
var _Linear;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const AccessTokenResponseSchema = _zod.z.object({
  access_token: _zod.z.string(),
  // Linear is in the process of switching to short-lived refresh tokens. Some apps
  // may not return a refresh token before April 2026, hence it's optional here.
  refresh_token: _zod.z.string().optional(),
  token_type: _zod.z.string(),
  expires_in: _zod.z.number(),
  scope: _zod.z.string()
});
class Linear {
  static async oauthAccess(code) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    };
    const body = new URLSearchParams();
    body.set("code", code);
    body.set("client_id", _env.default.LINEAR_CLIENT_ID);
    body.set("client_secret", _env.default.LINEAR_CLIENT_SECRET);
    body.set("redirect_uri", _LinearUtils.LinearUtils.callbackUrl());
    body.set("grant_type", "authorization_code");
    const res = await (0, _fetch.default)(_LinearUtils.LinearUtils.tokenUrl, {
      method: "POST",
      headers,
      body
    });
    if (res.status !== 200) {
      throw new Error(`Error while exchanging oauth code from Linear; status: ${res.status}`);
    }
    return AccessTokenResponseSchema.parse(await res.json());
  }
  static async refreshToken(refreshToken) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    };
    const body = new URLSearchParams();
    body.set("refresh_token", refreshToken);
    body.set("client_id", _env.default.LINEAR_CLIENT_ID);
    body.set("client_secret", _env.default.LINEAR_CLIENT_SECRET);
    body.set("grant_type", "refresh_token");
    const res = await (0, _fetch.default)(_LinearUtils.LinearUtils.tokenUrl, {
      method: "POST",
      headers,
      body
    });
    if (res.status !== 200) {
      throw new Error(`Error while refreshing access token from Linear; status: ${res.status}`);
    }
    return AccessTokenResponseSchema.parse(await res.json());
  }
  static async revokeAccess(accessToken) {
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };
    await (0, _fetch.default)(_LinearUtils.LinearUtils.revokeUrl, {
      method: "POST",
      headers
    });
  }
  static async getInstalledWorkspace(accessToken) {
    const client = new _sdk.LinearClient({
      accessToken
    });
    return client.organization;
  }

  /**
   *
   * @param url Linear resource url
   * @param actor User attempting to unfurl resource url
   * @returns An object containing resource details e.g, a Linear issue or project details
   */

  static async unfurlIssue(client, id, actor) {
    const issue = await client.issue(id);
    if (!issue) {
      return {
        error: "Resource not found"
      };
    }
    const [author, state, labels] = await Promise.all([issue.creator, issue.state, issue.paginate(args => issue.labels(args), {})]);
    if (!state || !labels) {
      return {
        error: "Failed to fetch auxiliary data from Linear"
      };
    }
    const completionPercentage = await Linear.completionPercentage(client, issue, state);
    return {
      type: _types.UnfurlResourceType.Issue,
      url: issue.url,
      id: issue.identifier,
      title: issue.title,
      description: issue.description ?? null,
      author: {
        name: author?.name ?? issue.botActor?.userDisplayName ?? issue.botActor?.name ?? (0, _i18next.t)("Unknown", (0, _i18n.opts)(actor)),
        avatarUrl: author?.avatarUrl ?? ""
      },
      labels: labels.map(label => ({
        name: label.name,
        color: label.color
      })),
      state: {
        type: state.type,
        name: state.name,
        color: state.color,
        completionPercentage
      },
      createdAt: issue.createdAt.toISOString()
    };
  }
  static async unfurlProject(client, id, _actor) {
    const project = await client.project(id);
    if (!project) {
      return {
        error: "Resource not found"
      };
    }
    const [lead, status, labels] = await Promise.all([project.lead, project.status, project.paginate(args => project.labels(args), {})]);
    if (!status || !labels) {
      return {
        error: "Failed to fetch auxiliary data from Linear"
      };
    }
    return {
      type: _types.UnfurlResourceType.Project,
      url: project.url,
      id: project.id,
      name: project.name,
      color: project.color ?? status.color,
      description: project.description ?? null,
      lead: lead ? {
        name: lead.name,
        avatarUrl: lead.avatarUrl ?? ""
      } : null,
      state: {
        type: status.type,
        name: status.name,
        color: status.color
      },
      labels: labels.map(label => ({
        name: label.name,
        color: label.color
      })),
      progress: project.progress,
      createdAt: project.createdAt.toISOString(),
      targetDate: project.targetDate ?? null
    };
  }
  static async completionPercentage(client, issue, state) {
    const defaultCompletionPercentage = 0.5; // fallback when we cannot determine actual value.

    if (state.type !== "started") {
      return defaultCompletionPercentage;
    }
    const team = await issue.team;
    if (!team) {
      return defaultCompletionPercentage;
    }
    const allStates = await client.paginate(args => client.workflowStates(args), {
      filter: {
        team: {
          id: {
            eq: team.id
          }
        },
        type: {
          eq: "started"
        }
      }
    });
    const states = (0, _compat.sortBy)(allStates.map(s => ({
      name: s.name,
      position: s.position
    })), s => s.position);
    const idx = states.findIndex(s => s.name === state.name);
    if (idx === -1) {
      return defaultCompletionPercentage;
    } else if (states.length === 1) {
      return 0.5;
    } else if (states.length === 2) {
      return idx === 0 ? 0.5 : 0.75;
    } else {
      return (idx + 1) / (states.length + 1); // add 1 to states for the "done" state.
    }
  }

  /**
   * Parses a given URL and returns resource identifiers for Linear specific URLs
   *
   * @param url URL to parse
   * @returns An object containing resource identifiers - `workspaceKey`, `type`, `id` and `name`.
   */
  static parseUrl(url) {
    try {
      const {
        hostname,
        pathname
      } = new URL(url);
      if (hostname !== "linear.app") {
        return;
      }
      const parts = pathname.split("/");
      const workspaceKey = parts[1];
      const type = parts[2] ? parts[2] : undefined;
      const id = parts[3];
      const name = parts[4];
      if (!type || !Linear.supportedUnfurls.includes(type)) {
        return;
      }
      return {
        workspaceKey,
        type,
        id,
        name
      };
    } catch (_err) {
      // Invalid URL format
      return;
    }
  }
}
exports.Linear = Linear;
_Linear = Linear;
_defineProperty(Linear, "supportedUnfurls", [_types.UnfurlResourceType.Issue, _types.UnfurlResourceType.Project]);
_defineProperty(Linear, "unfurl", async (url, actor) => {
  const resource = _Linear.parseUrl(url);
  if (!resource || !actor) {
    return;
  }
  const integrations = await _models.Integration.scope("withAuthentication").findAll({
    where: {
      service: _types.IntegrationService.Linear,
      teamId: actor.teamId
    }
  });
  if (integrations.length === 0) {
    return;
  }

  // Prefer integration with matching workspaceKey, otherwise pick the first one
  const integration = integrations.find(int => int.settings.linear?.workspace.key === resource.workspaceKey) ?? integrations[0];
  try {
    const accessToken = await integration.authentication.refreshTokenIfNeeded(async refreshToken => _Linear.refreshToken(refreshToken), 5 * _time.Minute.ms);
    const client = new _sdk.LinearClient({
      accessToken
    });
    switch (resource.type) {
      case _types.UnfurlResourceType.Issue:
        return await _Linear.unfurlIssue(client, resource.id, actor);
      case _types.UnfurlResourceType.Project:
        return await _Linear.unfurlProject(client, resource.id, actor);
      default:
        return;
    }
  } catch (err) {
    const error = (0, _error.toError)(err);
    _Logger.default.warn("Failed to fetch resource from Linear", error);
    return {
      error: error.message || "Unknown error"
    };
  }
});