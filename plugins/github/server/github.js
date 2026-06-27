"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitHub = void 0;
var _authApp = require("@octokit/auth-app");
var _sequelize = require("sequelize");
var _octokit = require("octokit");
var _pluralize = _interopRequireDefault(require("pluralize"));
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _models = require("../../../server/models");
var _GitHubUtils = require("../shared/GitHubUtils");
var _env = _interopRequireDefault(require("./env"));
var _GitHub;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const requestPlugin = octokit => ({
  requestRepos: () => octokit.paginate.iterator(octokit.rest.apps.listReposAccessibleToInstallation, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  requestPR: async params => octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}`, {
    owner: params.owner,
    repo: params.repo,
    pull_number: params.id,
    headers: {
      Accept: "application/vnd.github.text+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  requestIssue: async params => octokit.request(`GET /repos/{owner}/{repo}/issues/{issue_number}`, {
    owner: params.owner,
    repo: params.repo,
    issue_number: params.id,
    headers: {
      Accept: "application/vnd.github.text+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  /**
   * Fetches details of a GitHub ProjectV2 using the GraphQL API.
   *
   * @param params Parsed project URL identifiers.
   * @returns Project data or undefined if not found.
   */
  requestProject: async params => {
    const ownerField = params.ownerType === "orgs" ? "organization" : "user";
    const query = `query($login: String!, $number: Int!) {
      ${ownerField}(login: $login) {
        projectV2(number: $number) {
          number
          title
          shortDescription
          url
          createdAt
          closed
        }
      }
    }`;
    const result = await octokit.graphql(query, {
      login: params.owner,
      number: params.projectNumber
    });
    const project = result[ownerField]?.projectV2;
    if (!project) {
      return undefined;
    }
    return {
      number: project.number,
      title: project.title,
      description: project.shortDescription,
      url: project.url,
      createdAt: project.createdAt,
      closed: project.closed
    };
  },
  /**
   * Fetches app installations accessible to the user
   *
   * @returns {Array} Containing details of all app installations done by user
   */
  requestAppInstallations: async () => octokit.paginate("GET /user/installations"),
  /**
   * Fetches details of a GitHub resource, e.g, a pull request or an issue
   *
   * @param resource Contains identifiers which are used to construct resource endpoint, e.g, `/repos/{params.owner}/{params.repo}/pulls/{params.id}`
   * @returns Response containing resource details
   */
  requestResource: async function requestResource(resource) {
    switch (resource?.type) {
      case _types.UnfurlResourceType.PR:
        return this.requestPR(resource);
      case _types.UnfurlResourceType.Issue:
        return this.requestIssue(resource);
      default:
        return;
    }
  },
  /**
   * Fetches details of a specific GitHub app installation
   *
   * @param installationId Id of the installation to fetch
   * @returns Response containing installation details
   */
  requestAppInstallation: async installationId => octokit.request("GET /app/installations/{installation_id}", {
    installation_id: installationId,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  /**
   * Uninstalls the GitHub app from a given target
   *
   * @param installationId Id of the target from where to uninstall
   */
  requestAppUninstall: async installationId => octokit.request("DELETE /app/installations/{id}", {
    id: installationId
  })
});
const CustomOctokit = _octokit.Octokit.plugin(requestPlugin);
class GitHub {
  /**
   * Parses a given URL and returns resource identifiers for GitHub specific URLs
   *
   * @param url URL to parse
   * @returns {object} Containing resource identifiers - `owner`, `repo`, `type` and `id`.
   */
  static parseUrl(url) {
    try {
      const {
        hostname,
        pathname
      } = new URL(url);
      if (hostname !== "github.com") {
        return;
      }
      const parts = pathname.split("/");

      // Handle project URLs: /orgs/{org}/projects/{number} or /users/{user}/projects/{number}
      if ((parts[1] === "orgs" || parts[1] === "users") && parts[3] === "projects") {
        const ownerType = parts[1];
        const owner = parts[2];
        const projectNumber = Number(parts[4]);
        if (!owner || isNaN(projectNumber)) {
          return;
        }
        return {
          owner,
          ownerType,
          type: _types.UnfurlResourceType.Project,
          projectNumber,
          url
        };
      }
      const owner = parts[1];
      const repo = parts[2];
      const type = parts[3] ? _pluralize.default.singular(parts[3]) : undefined;
      const id = Number(parts[4]);
      if (!type || !GitHub.supportedResources.includes(type) || isNaN(id)) {
        return;
      }
      return {
        owner,
        repo,
        type: type,
        id,
        url
      };
    } catch (_err) {
      // Invalid URL format
      return;
    }
  }
  static async unfurlProject(client, resource) {
    let project;
    try {
      project = await client.requestProject(resource);
    } catch (err) {
      _Logger.default.warn("Failed to fetch project from GitHub", (0, _error.toError)(err));
      return {
        error: "Resource not found"
      };
    }
    if (!project) {
      return {
        error: "Resource not found"
      };
    }
    const state = project.closed ? "completed" : "open";
    return {
      type: _types.UnfurlResourceType.Project,
      url: project.url,
      id: `#${project.number}`,
      name: project.title,
      color: _GitHubUtils.GitHubUtils.getColorForStatus(state),
      description: project.description,
      lead: null,
      state: {
        type: state,
        name: state,
        color: _GitHubUtils.GitHubUtils.getColorForStatus(state)
      },
      labels: [],
      createdAt: project.createdAt,
      targetDate: null
    };
  }
  static transformData(data, type) {
    if (type === _types.UnfurlResourceType.Issue) {
      const issue = data;
      const issueState = issue.state === "closed" ? issue.state_reason === "completed" ? "completed" : "canceled" : issue.state;
      return {
        type: _types.UnfurlResourceType.Issue,
        url: issue.html_url,
        id: `#${issue.number}`,
        title: issue.title,
        description: issue.body_text ?? null,
        author: {
          name: issue.user?.login ?? "",
          avatarUrl: issue.user?.avatar_url ?? ""
        },
        labels: issue.labels.map(label => ({
          name: label.name,
          color: `#${label.color}`
        })),
        state: {
          name: issueState,
          color: _GitHubUtils.GitHubUtils.getColorForStatus(issueState)
        },
        createdAt: issue.created_at
      };
    }
    const pr = data;
    const prState = pr.merged ? "merged" : pr.state;
    return {
      type: _types.UnfurlResourceType.PR,
      url: pr.html_url,
      id: `#${pr.number}`,
      title: pr.title,
      description: pr.body,
      author: {
        name: pr.user.login,
        avatarUrl: pr.user.avatar_url
      },
      state: {
        name: prState,
        color: _GitHubUtils.GitHubUtils.getColorForStatus(prState, !!pr.draft),
        draft: pr.draft
      },
      createdAt: pr.created_at
    };
  }
}
exports.GitHub = GitHub;
_GitHub = GitHub;
_defineProperty(GitHub, "appId", _env.default.GITHUB_APP_ID);
_defineProperty(GitHub, "appKey", _env.default.GITHUB_APP_PRIVATE_KEY ? Buffer.from(_env.default.GITHUB_APP_PRIVATE_KEY, "base64").toString("ascii") : undefined);
_defineProperty(GitHub, "clientId", _env.default.GITHUB_CLIENT_ID);
_defineProperty(GitHub, "clientSecret", _env.default.GITHUB_CLIENT_SECRET);
_defineProperty(GitHub, "appOctokit", void 0);
_defineProperty(GitHub, "supportedResources", [_types.UnfurlResourceType.Issue, _types.UnfurlResourceType.PR]);
_defineProperty(GitHub, "authenticateAsApp", () => {
  if (!_GitHub.appOctokit) {
    _GitHub.appOctokit = new CustomOctokit({
      authStrategy: _authApp.createAppAuth,
      auth: {
        appId: _GitHub.appId,
        privateKey: _GitHub.appKey,
        clientId: _GitHub.clientId,
        clientSecret: _GitHub.clientSecret
      }
    });
  }
  return _GitHub.appOctokit;
});
/**
 * [Authenticates as a GitHub user](https://github.com/octokit/auth-app.js/?tab=readme-ov-file#authenticate-as-installation)
 *
 * @param code Temporary code received in callback url after user authorizes
 * @param state A string received in callback url to protect against CSRF
 * @returns {Octokit} User-authenticated octokit instance
 */
_defineProperty(GitHub, "authenticateAsUser", async (code, state) => _GitHub.authenticateAsApp().auth({
  type: "oauth-user",
  code,
  state,
  factory: options => new CustomOctokit({
    authStrategy: _authApp.createOAuthUserAuth,
    auth: options
  })
}));
/**
 * [Authenticates as a GitHub app installation](https://github.com/octokit/auth-app.js/?tab=readme-ov-file#authenticate-as-installation)
 *
 * @param installationId Id of an installation
 * @returns {Octokit} Installation-authenticated octokit instance
 */
_defineProperty(GitHub, "authenticateAsInstallation", async installationId => _GitHub.authenticateAsApp().auth({
  type: "installation",
  installationId,
  factory: options => new CustomOctokit({
    authStrategy: _authApp.createAppAuth,
    auth: options
  })
}));
/**
 *
 * @param url GitHub resource url
 * @param actor User attempting to unfurl resource url
 * @returns An object containing resource details e.g, a GitHub Pull Request details
 */
_defineProperty(GitHub, "unfurl", async (url, actor) => {
  const resource = _GitHub.parseUrl(url);
  if (!resource || !actor) {
    return;
  }

  // Find integration, prioritizing one where the installation account matches the resource owner
  const integration = await _models.Integration.findOne({
    where: {
      service: _types.IntegrationService.GitHub,
      teamId: actor.teamId
    },
    order: [[_sequelize.Sequelize.literal(`CASE WHEN "settings"->'github'->'installation'->'account'->>'name' = :owner THEN 0 ELSE 1 END`), "ASC"]],
    replacements: {
      owner: resource.owner
    }
  });
  if (!integration) {
    return;
  }
  try {
    const client = await _GitHub.authenticateAsInstallation(integration.settings.github.installation.id);
    if (resource.type === _types.UnfurlResourceType.Project) {
      return _GitHub.unfurlProject(client, resource);
    }
    const res = await client.requestResource(resource);
    if (!res) {
      return {
        error: "Resource not found"
      };
    }
    return _GitHub.transformData(res.data, resource.type);
  } catch (err) {
    _Logger.default.warn("Failed to fetch resource from GitHub", (0, _error.toError)(err));
    return {
      error: (0, _error.errToString)(err) || "Unknown error"
    };
  }
});