"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _error = require("../../../../shared/utils/error");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _env = _interopRequireDefault(require("../env"));
var _oidcDiscovery = require("../oidcDiscovery");
var _oidcRouter = require("./oidcRouter");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
let routerPromise = Promise.resolve(router);

// Check if we have manual configuration
const hasManualConfig = !!(_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_AUTH_URI && _env.default.OIDC_TOKEN_URI && _env.default.OIDC_USERINFO_URI);

// Check if we have issuer configuration for discovery
const hasIssuerConfig = !!(_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_ISSUER_URL);
if (hasManualConfig) {
  // Mount endpoints immediately with manual configuration
  (0, _oidcRouter.createOIDCRouter)(router, {
    authorizationURL: _env.default.OIDC_AUTH_URI,
    tokenURL: _env.default.OIDC_TOKEN_URI,
    userInfoURL: _env.default.OIDC_USERINFO_URI,
    logoutURL: _env.default.OIDC_LOGOUT_URI
  });
  _Logger.default.info("plugins", "OIDC endpoints mounted with manual configuration");
} else if (hasIssuerConfig) {
  // Asynchronously discover configuration and mount endpoints
  routerPromise = (async () => {
    try {
      _Logger.default.debug("plugins", "Starting OIDC configuration discovery");
      const oidcConfig = await (0, _oidcDiscovery.fetchOIDCConfiguration)(_env.default.OIDC_ISSUER_URL);

      // Set environment variables for OIDC endpoints so they can be read by OIDC OAuth class
      _env.default.OIDC_AUTH_URI = oidcConfig.authorization_endpoint;
      _env.default.OIDC_TOKEN_URI = oidcConfig.token_endpoint;
      _env.default.OIDC_USERINFO_URI = oidcConfig.userinfo_endpoint;

      // Mount endpoints into the existing router
      (0, _oidcRouter.createOIDCRouter)(router, {
        authorizationURL: oidcConfig.authorization_endpoint,
        tokenURL: oidcConfig.token_endpoint,
        userInfoURL: oidcConfig.userinfo_endpoint,
        logoutURL: oidcConfig.end_session_endpoint,
        pkce: oidcConfig.code_challenge_methods_supported?.includes("S256")
      });
      _Logger.default.info("plugins", "OIDC endpoints mounted after discovery", {
        issuer: oidcConfig.issuer,
        authorization_endpoint: oidcConfig.authorization_endpoint,
        token_endpoint: oidcConfig.token_endpoint,
        userinfo_endpoint: oidcConfig.userinfo_endpoint
      });
      return router;
    } catch (error) {
      _Logger.default.fatal("Failed to discover OIDC configuration", (0, _error.toError)(error));
      throw error;
    }
  })();
}
var _default = exports.default = routerPromise;