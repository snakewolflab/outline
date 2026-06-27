"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinearUtils = exports.LinearOAuthNonceCookie = void 0;
var _queryString = _interopRequireDefault(require("query-string"));
var _env = _interopRequireDefault(require("../../../shared/env"));
var _routeHelpers = require("../../../shared/utils/routeHelpers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const LinearOAuthNonceCookie = exports.LinearOAuthNonceCookie = "linearOAuthNonce";
class LinearUtils {
  static parseState(state) {
    try {
      return JSON.parse(state);
    } catch {
      return undefined;
    }
  }
  static successUrl() {
    return this.settingsUrl;
  }
  static errorUrl(error) {
    return `${this.settingsUrl}?error=${error}`;
  }
  static callbackUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: _env.default.URL,
      params: undefined
    };
    return params ? `${baseUrl}/api/linear.callback?${params}` : `${baseUrl}/api/linear.callback`;
  }
  static authUrl(_ref) {
    let {
      state
    } = _ref;
    const params = {
      client_id: _env.default.LINEAR_CLIENT_ID,
      redirect_uri: this.callbackUrl(),
      state: JSON.stringify(state),
      scope: this.oauthScopes,
      response_type: "code",
      prompt: "consent",
      actor: "app"
    };
    return `${this.authBaseUrl}?${_queryString.default.stringify(params)}`;
  }
}
exports.LinearUtils = LinearUtils;
_defineProperty(LinearUtils, "oauthScopes", "read,issues:create");
_defineProperty(LinearUtils, "tokenUrl", "https://api.linear.app/oauth/token");
_defineProperty(LinearUtils, "revokeUrl", "https://api.linear.app/oauth/revoke");
_defineProperty(LinearUtils, "authBaseUrl", "https://linear.app/oauth/authorize");
_defineProperty(LinearUtils, "settingsUrl", (0, _routeHelpers.integrationSettingsPath)("linear"));