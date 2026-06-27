"use strict";

var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _oidc = _interopRequireDefault(require("./auth/oidc"));
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Check if OIDC is enabled with either manual configuration or issuer URL
const hasManualConfig = !!(_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_AUTH_URI && _env.default.OIDC_TOKEN_URI && _env.default.OIDC_USERINFO_URI);
const hasIssuerConfig = !!(_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_ISSUER_URL);
const enabled = hasManualConfig || hasIssuerConfig;
if (enabled) {
  // Register plugin with the router (which handles both manual and discovery config)
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _oidc.default,
      id: _plugin.default.id
    },
    name: _env.default.OIDC_DISPLAY_NAME || _plugin.default.name
  }]);
  _Logger.default.info("plugins", "OIDC plugin registered");
}