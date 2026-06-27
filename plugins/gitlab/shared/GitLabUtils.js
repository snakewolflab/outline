"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitLabUtils = exports.GitLabOAuthNonceCookie = void 0;
var _env = _interopRequireDefault(require("../../../shared/env"));
var _routeHelpers = require("../../../shared/utils/routeHelpers");
var _types = require("../../../shared/types");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const GitLabOAuthNonceCookie = exports.GitLabOAuthNonceCookie = "gitlabOAuthNonce";
class GitLabUtils {
  /**
   * Gets the GitLab URL, preferring the provided custom URL over the default.
   *
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns The GitLab URL to use.
   */
  static getGitlabUrl(customUrl) {
    return customUrl || this.defaultGitlabUrl;
  }

  /**
   * Gets the OAuth URL for the provided custom GitLab URL or default environment URL.
   *
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns The OAuth URL.
   */
  static getOauthUrl(customUrl) {
    return `${this.getGitlabUrl(customUrl)}/oauth`;
  }
  static get url() {
    return (0, _routeHelpers.integrationSettingsPath)("gitlab");
  }

  /**
   * Generates the error URL for GitLab authorization errors.
   *
   * @param error - The error message to include in the URL.
   * @returns The URL to redirect to upon authorization error.
   */
  static errorUrl(error) {
    return `${this.url}?error=${encodeURIComponent(error)}`;
  }

  /**
   * Generates the callback URL for GitLab OAuth.
   *
   * @param baseUrl - The base URL of the application.
   * @param params - Optional query parameters to include in the callback URL.
   * @returns The full callback URL.
   */
  static callbackUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: _env.default.URL,
      params: undefined
    };
    const callbackPath = "/api/gitlab.callback";
    return params ? `${baseUrl}${callbackPath}?${params}` : `${baseUrl}${callbackPath}`;
  }

  /**
   * Generates the authorization URL for GitLab OAuth.
   *
   * @param state - The OAuth state with teamId for routing and nonce for CSRF.
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @param customClientId - Optional custom OAuth client ID from integration settings.
   * @returns The full URL to redirect the user to GitLab's OAuth authorization page.
   */
  static authUrl(state, customUrl, customClientId) {
    const params = new URLSearchParams({
      client_id: customClientId || _env.default.GITLAB_CLIENT_ID,
      redirect_uri: this.callbackUrl(),
      response_type: "code",
      state: JSON.stringify(state),
      scope: "read_api read_user"
    });
    return `${this.getOauthUrl(customUrl)}/authorize?${params.toString()}`;
  }

  /**
   * Parses an OAuth state string from a GitLab callback.
   *
   * @param state - The state string carried in the callback query.
   * @returns The parsed OAuth state.
   */
  static parseState(state) {
    try {
      return JSON.parse(state);
    } catch {
      return undefined;
    }
  }

  /**
   * Generates the installation request URL.
   *
   * @returns The URL for installation requests.
   */
  static installRequestUrl() {
    return `${this.url}?install_request=true`;
  }

  /**
   * Parses a GitLab URL and extracts resource identifiers.
   *
   * @param url - The GitLab URL to parse.
   * @param customUrl - Optional custom GitLab URL from integration settings.
   * @returns An object containing resource identifiers or undefined if the URL is invalid.
   */
  static parseUrl(url, customUrl) {
    try {
      const parsed = new URL(url);
      const urlHostname = new URL(this.getGitlabUrl(customUrl)).hostname;
      if (parsed.hostname !== urlHostname) {
        return;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);

      // Try base64-encoded `show` query parameter first
      // e.g. /owner/repo/-/issues?show=eyJ...
      const showParam = parsed.searchParams.get("show");
      if (showParam && parts.length >= 4) {
        const resourceType = parts.pop();
        parts.pop(); // separator ("-")
        const repo = parts.pop();
        const owner = parts.join("/");
        const type = resourceType === "issues" || resourceType === "work_items" ? _types.UnfurlResourceType.Issue : resourceType === "merge_requests" ? _types.UnfurlResourceType.PR : undefined;
        if (!type || !this.supportedResources.includes(type)) {
          return;
        }
        try {
          const decoded = JSON.parse(atob(decodeURIComponent(showParam)));
          const iid = Number(decoded.iid);
          if (!iid) {
            return;
          }
          return {
            owner,
            repo,
            type,
            id: iid,
            url
          };
        } catch {
          return;
        }
      }

      // Check if it's a project URL (no -/ separator pattern in path)
      if (!parsed.pathname.includes("/-/")) {
        if (parts.length >= 2 && !this.isSystemPath(parts[0])) {
          const repo = parts[parts.length - 1];
          const owner = parts.slice(0, -1).join("/");
          return {
            owner,
            repo,
            type: _types.UnfurlResourceType.Project,
            url
          };
        }
        return;
      }
      if (parts.length < 5) {
        return;
      }

      // Direct URL: /owner/repo/-/issues/123 or /owner/repo/-/merge_requests/123
      const resourceId = parts.pop();
      const resourceType = parts.pop();
      parts.pop(); // separator ("-")

      const repo = parts.pop();
      const owner = parts.join("/");
      const type = resourceType === "issues" || resourceType === "work_items" ? _types.UnfurlResourceType.Issue : resourceType === "merge_requests" ? _types.UnfurlResourceType.PR : undefined;
      if (!type || !this.supportedResources.includes(type)) {
        return;
      }
      return {
        owner,
        repo,
        type,
        id: Number(resourceId),
        url
      };
    } catch {
      return;
    }
  }

  /**
   * Checks if the first path segment is a known GitLab system path.
   *
   * @param segment - the first path segment of the URL.
   * @returns true if the segment is a known system path.
   */
  static isSystemPath(segment) {
    const systemPaths = new Set(["explore", "help", "admin", "dashboard", "users", "groups", "projects", "snippets", "search", "-"]);
    return systemPaths.has(segment);
  }

  /**
   * Returns the color associated with a given status.
   *
   * @param status - The status of the resource.
   * @param isDraftMR - Whether the resource is a draft merge request.
   * @returns The color associated with the status.
   */
  static getColorForStatus(status) {
    let isDraftMR = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const statusColors = {
      opened: isDraftMR ? "#848d97" : "#1f75cb",
      done: "#a371f7",
      closed: "#f85149",
      merged: "#8250df",
      canceled: "#848d97"
    };
    return statusColors[status] ?? "#848d97";
  }

  /**
   * Returns a deterministic color for a GitLab project based on its ID.
   * Mirrors GitLab's identicon algorithm: (id % 7) mapped to a palette.
   *
   * @param projectId - the numeric project ID.
   * @returns a hex color string.
   */
  static getColorForProject(projectId) {
    const palette = ["#e05842",
    // red
    "#a972cc",
    // purple
    "#5b6abf",
    // indigo
    "#3e8fda",
    // blue
    "#42a68c",
    // teal
    "#e67e3c",
    // orange
    "#7e7e7e" // neutral
    ];
    return palette[projectId % 7];
  }

  /**
   * Sanitizes GitLab-flavored markdown to standard markdown compatible with
   * our editor. Strips or converts GitLab-specific syntax that would otherwise
   * render as raw text in previews.
   *
   * Note: This is for display purposes only and is not a security boundary.
   * Do not rely on this to sanitize untrusted HTML.
   *
   * @param text - the markdown text to sanitize.
   * @returns the sanitized text, or null if input is null/undefined.
   */
  static sanitizeGitLabMarkdown(text) {
    if (!text) {
      return null;
    }

    // Strip HTML comments repeatedly in case of overlapping patterns like
    // `<!<!-- x -->-- -->` that would leave `<!--` after a single pass.
    let result = text;
    let prev;
    do {
      prev = result;
      result = result.replace(/<!--[\s\S]*?-->/g, "");
    } while (result !== prev);
    return result
    // YAML front matter
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
    // Collapsible sections: extract inner content
    .replace(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi, "**$1**\n$2")
    // TOC markers
    .replace(/\[\[_TOC_\]\]/g, "").replace(/^\[TOC\]$/gm, "")
    // Inline diffs
    .replace(/\{\+([\s\S]*?)\+\}/g, "$1").replace(/\[-([\s\S]*?)-\]/g, "~~$1~~")
    // Multiline blockquotes
    .replace(/^>>>\s*$/gm, "")
    // Footnote definitions
    .replace(/^\[\^[^\]]+\]:\s+.*$/gm, "")
    // Footnote references
    .replace(/\[\^([^\]]+)\]/g, "")
    // Include directives
    .replace(/^::include\{[^}]*\}$/gm, "")
    // Clean up excessive blank lines left by removals
    .replace(/\n{3,}/g, "\n\n").trim() || null;
  }

  /**
   * Returns the color associated with a given visibility level.
   *
   * @param visibility - The visibility level of the resource.
   * @returns The color associated with the visibility level.
   */
  static getColorForVisibility(visibility) {
    const visibilityColors = {
      public: "#1f75cb",
      internal: "#f8ae1a",
      private: "#848d97"
    };
    return visibilityColors[visibility] ?? "#848d97";
  }
}
exports.GitLabUtils = GitLabUtils;
_defineProperty(GitLabUtils, "defaultGitlabUrl", "https://gitlab.com");
_defineProperty(GitLabUtils, "supportedResources", [_types.UnfurlResourceType.Issue, _types.UnfurlResourceType.PR, _types.UnfurlResourceType.Project]);