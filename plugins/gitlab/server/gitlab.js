"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitLab = void 0;
var _rest = require("@gitbeaker/rest");
var _zod = _interopRequireDefault(require("zod"));
var _types = require("../../../shared/types");
var _error = require("../../../shared/utils/error");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _models = require("../../../server/models");
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
var _url = require("../../../server/utils/url");
var _GitLabUtils = require("../shared/GitLabUtils");
var _env = _interopRequireDefault(require("./env"));
var _GitLab;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const AccessTokenResponseSchema = _zod.default.object({
  access_token: _zod.default.string(),
  token_type: _zod.default.string(),
  expires_in: _zod.default.number(),
  refresh_token: _zod.default.string(),
  scope: _zod.default.string(),
  created_at: _zod.default.number()
});
class GitLab {
  /**
   * Fetches the custom GitLab URL for a team from the first matching
   * integration, falling back to the default.
   *
   * @param teamId - The team ID to fetch settings for.
   * @returns The GitLab URL to use.
   */
  static async getGitLabUrl(teamId) {
    const integration = await _models.Integration.findOne({
      where: {
        service: _types.IntegrationService.GitLab,
        teamId
      }
    });
    const url = integration?.settings?.gitlab?.url;
    return url || _GitLabUtils.GitLabUtils.defaultGitlabUrl;
  }

  /**
   * Creates a Gitbeaker client instance.
   *
   * @param accessToken - The access token for authentication.
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns A configured Gitbeaker client.
   */
  static async createClient(accessToken, customUrl) {
    const host = customUrl || _GitLabUtils.GitLabUtils.defaultGitlabUrl;

    // Validate the URL to prevent SSRF as GitLab instance does not use our
    // fetch wrapper which has built-in SSRF protection.
    await (0, _url.validateUrlNotPrivate)(host);
    return new _rest.Gitlab({
      host,
      oauthToken: accessToken
    });
  }

  /**
   * Fetches an issue from a GitLab project.
   *
   * @param accessToken - The access token for authentication.
   * @param projectPath - The project path (owner/repo).
   * @param issueIid - The issue IID (internal ID within the project).
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns The issue data.
   */
  static async getIssue(accessToken, projectPath, issueIid, customUrl) {
    const client = await this.createClient(accessToken, customUrl);
    const issues = await client.Issues.all({
      projectId: projectPath,
      iids: [issueIid],
      withLabelsDetails: true
    });
    if (!issues || issues.length === 0) {
      throw new Error(`Issue ${issueIid} not found in project ${projectPath}`);
    }
    return issues[0];
  }

  /**
   * Fetches a merge request from a GitLab project.
   *
   * @param accessToken - The access token for authentication.
   * @param projectPath - The project path (owner/repo).
   * @param mrIid - The merge request IID (internal ID within the project).
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns The merge request data.
   */
  static async getMergeRequest(accessToken, projectPath, mrIid, customUrl) {
    const client = await this.createClient(accessToken, customUrl);
    const mr = await client.MergeRequests.show(projectPath, mrIid);
    return mr;
  }

  /**
   * Fetches current user information.
   *
   * @param params.accessToken - Access token received from OAuth flow.
   * @param params.customUrl - Optional custom GitLab URL. Falls back to default.
   * @returns User information including the resolved URL.
   */
  static async getCurrentUser(_ref) {
    let {
      accessToken,
      customUrl
    } = _ref;
    const url = customUrl || _GitLabUtils.GitLabUtils.defaultGitlabUrl;
    const client = await this.createClient(accessToken, url);
    const userData = await client.Users.showCurrentUser({
      showExpanded: false
    });
    return {
      ...userData,
      url
    };
  }

  /**
   * Fetches projects accessible to the user.
   *
   * @param accessToken - Access token for authentication.
   * @returns Array of projects.
   */
  static async getProjects(_ref2) {
    let {
      accessToken,
      teamId
    } = _ref2;
    const customUrl = await this.getGitLabUrl(teamId);
    const client = await this.createClient(accessToken, customUrl);
    const projects = await client.Projects.all({
      simple: true,
      perPage: 100,
      minAccessLevel: 40 // At least Maintainer access to reduce the sheer volume of projects
    });
    return projects;
  }

  /**
   * @param url GitLab resource url
   * @param actor User attempting to unfurl resource url
   * @returns An object containing resource details e.g, a GitLab Merge Request details
   */

  static async refreshToken(_ref3) {
    let {
      refreshToken,
      customUrl,
      clientId,
      clientSecret
    } = _ref3;
    const queryParams = new URLSearchParams({
      client_id: clientId || this.clientId,
      client_secret: clientSecret || this.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      redirect_uri: _GitLabUtils.GitLabUtils.callbackUrl()
    });
    const res = await (0, _fetch.default)(`${_GitLabUtils.GitLabUtils.getOauthUrl(customUrl)}/token?${queryParams.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      }
    });
    const resJson = await res.json();
    if (res.status !== 200) {
      _Logger.default.error("failed to refresh access token from GitLab", resJson);
      throw new Error(`Error while refreshing access token from GitLab; status: ${res.status}`);
    }
    return AccessTokenResponseSchema.parse(resJson);
  }
  static transformIssue(issue) {
    return {
      type: _types.UnfurlResourceType.Issue,
      url: issue.web_url,
      id: `#${issue.iid}`,
      title: issue.title,
      description: _GitLabUtils.GitLabUtils.sanitizeGitLabMarkdown(issue.description),
      author: {
        name: issue.author?.username ?? "",
        avatarUrl: issue.author?.avatar_url ?? ""
      },
      labels: issue.labels.map(label => ({
        name: label.name,
        color: label.color
      })),
      state: {
        name: issue.state,
        color: _GitLabUtils.GitLabUtils.getColorForStatus(issue.state)
      },
      createdAt: issue.created_at
    };
  }
  static transformMR(mr) {
    const mrState = mr.merged_at ? "merged" : mr.state;
    return {
      type: _types.UnfurlResourceType.PR,
      url: mr.web_url,
      id: `!${mr.iid}`,
      title: mr.title,
      description: _GitLabUtils.GitLabUtils.sanitizeGitLabMarkdown(mr.description) ?? "",
      author: {
        name: mr.author.username,
        avatarUrl: mr.author.avatar_url
      },
      state: {
        name: mrState,
        color: _GitLabUtils.GitLabUtils.getColorForStatus(mrState, !!mr.draft),
        draft: mr.draft
      },
      createdAt: mr.created_at
    };
  }
  static transformProject(project, issueStats) {
    const visibility = project.visibility ?? "private";
    const owner = project.owner;
    const {
      opened,
      closed
    } = issueStats.statistics.counts;
    const total = opened + closed;
    const progress = total > 0 ? closed / total : 0;
    return {
      type: _types.UnfurlResourceType.Project,
      url: project.web_url,
      id: String(project.id),
      name: project.name,
      color: _GitLabUtils.GitLabUtils.getColorForProject(project.id),
      avatarUrl: project.avatar_url || undefined,
      description: _GitLabUtils.GitLabUtils.sanitizeGitLabMarkdown(project.description),
      lead: owner ? {
        name: owner.name,
        avatarUrl: owner.avatar_url ?? ""
      } : null,
      state: {
        type: visibility,
        name: visibility.charAt(0).toUpperCase() + visibility.slice(1),
        color: _GitLabUtils.GitLabUtils.getColorForVisibility(visibility)
      },
      labels: (project.topics ?? []).map(topic => ({
        name: topic,
        color: "#6B7280"
      })),
      progress,
      createdAt: project.created_at,
      targetDate: null
    };
  }
}
exports.GitLab = GitLab;
_GitLab = GitLab;
_defineProperty(GitLab, "clientSecret", _env.default.GITLAB_CLIENT_SECRET);
_defineProperty(GitLab, "clientId", _env.default.GITLAB_CLIENT_ID);
_defineProperty(GitLab, "unfurl", async (url, actor) => {
  const integrations = await _models.Integration.findAll({
    where: {
      service: _types.IntegrationService.GitLab,
      teamId: actor.teamId
    },
    include: [{
      model: _models.IntegrationAuthentication,
      as: "authentication",
      required: true
    }]
  });
  if (integrations.length === 0) {
    _Logger.default.debug("plugins", `No GitLab integrations found for team ${actor.teamId}`);
    return;
  }

  // Try to parse the URL against each integration's custom URL
  let matchedIntegration;
  let resource;
  for (const integration of integrations) {
    const customUrl = integration.settings?.gitlab?.url;
    resource = _GitLabUtils.GitLabUtils.parseUrl(url, customUrl);
    if (resource) {
      matchedIntegration = integration;
      break;
    }
  }
  if (!resource) {
    return;
  }
  if (!matchedIntegration?.authentication) {
    _Logger.default.debug("plugins", `No authentication found for matched integration`);
    return;
  }
  try {
    const customUrl = matchedIntegration.settings?.gitlab?.url;
    const projectPath = `${resource.owner}/${resource.repo}`;
    const {
      authentication
    } = matchedIntegration;
    const token = await authentication.refreshTokenIfNeeded(async refreshToken => _GitLab.refreshToken({
      refreshToken,
      customUrl,
      clientId: authentication.clientId ?? undefined,
      clientSecret: authentication.clientSecret ?? undefined
    }));
    if (resource.type === _types.UnfurlResourceType.Issue) {
      const issue = await _GitLab.getIssue(token, projectPath, resource.id, customUrl);
      return _GitLab.transformIssue(issue);
    } else if (resource.type === _types.UnfurlResourceType.PR) {
      const mr = await _GitLab.getMergeRequest(token, projectPath, resource.id, customUrl);
      return _GitLab.transformMR(mr);
    } else if (resource.type === _types.UnfurlResourceType.Project) {
      const client = await _GitLab.createClient(token, customUrl);
      const [project, issueStats] = await Promise.all([client.Projects.show(projectPath), client.IssuesStatistics.all({
        projectId: projectPath
      })]);
      return _GitLab.transformProject(project, issueStats);
    }
    return {
      error: "Resource not found"
    };
  } catch (err) {
    _Logger.default.warn("Failed to fetch resource from GitLab", (0, _error.toError)(err));
    return {
      error: (0, _error.errToString)(err) || "Unknown error"
    };
  }
});
/**
 * Exchanges an authorization code for an access token.
 *
 * @param params.code - The authorization code from the OAuth callback.
 * @param params.customUrl - Optional custom GitLab URL. Falls back to default.
 * @param params.clientId - Optional custom client ID (falls back to env var).
 * @param params.clientSecret - Optional custom client secret (falls back to env var).
 * @returns The parsed access token response.
 */
_defineProperty(GitLab, "oauthAccess", async _ref4 => {
  let {
    code,
    customUrl,
    clientId,
    clientSecret
  } = _ref4;
  const url = customUrl || _GitLabUtils.GitLabUtils.defaultGitlabUrl;
  const res = await (0, _fetch.default)(_GitLabUtils.GitLabUtils.getOauthUrl(url) + "/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: clientId || _GitLab.clientId,
      client_secret: clientSecret || _GitLab.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: _GitLabUtils.GitLabUtils.callbackUrl()
    })
  });
  if (res.status !== 200) {
    throw new Error(`Error while validating oauth code from GitLab; status: ${res.status}`);
  }
  return AccessTokenResponseSchema.parse(await res.json());
});