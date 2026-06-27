"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotionUtils = exports.NotionOAuthNonceCookie = void 0;
var _queryString = _interopRequireDefault(require("query-string"));
var _env = _interopRequireDefault(require("../../../shared/env"));
var _types = require("../../../shared/types");
var _routeHelpers = require("../../../shared/utils/routeHelpers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const NotionOAuthNonceCookie = exports.NotionOAuthNonceCookie = "notionOAuthNonce";
class NotionUtils {
  static parseState(state) {
    try {
      return JSON.parse(state);
    } catch {
      return undefined;
    }
  }
  static successUrl(integrationId) {
    const params = {
      success: "",
      service: _types.IntegrationService.Notion,
      integrationId
    };
    return `${this.settingsUrl}?${_queryString.default.stringify(params)}`;
  }
  static errorUrl(error) {
    const params = {
      error,
      service: _types.IntegrationService.Notion
    };
    return `${this.settingsUrl}?${_queryString.default.stringify(params)}`;
  }
  static callbackUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: _env.default.URL,
      params: undefined
    };
    return params ? `${baseUrl}/api/notion.callback?${params}` : `${baseUrl}/api/notion.callback`;
  }
  static authUrl(_ref) {
    let {
      state
    } = _ref;
    const params = {
      client_id: _env.default.NOTION_CLIENT_ID,
      redirect_uri: this.callbackUrl(),
      state: JSON.stringify(state),
      response_type: "code",
      owner: "user"
    };
    return `${this.authBaseUrl}?${_queryString.default.stringify(params)}`;
  }
}
exports.NotionUtils = NotionUtils;
_defineProperty(NotionUtils, "tokenUrl", "https://api.notion.com/v1/oauth/token");
_defineProperty(NotionUtils, "authBaseUrl", "https://api.notion.com/v1/oauth/authorize");
_defineProperty(NotionUtils, "settingsUrl", (0, _routeHelpers.settingsPath)("import"));