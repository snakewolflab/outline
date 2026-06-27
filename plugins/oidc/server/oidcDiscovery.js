"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchOIDCConfiguration = fetchOIDCConfiguration;
var _error = require("../../../shared/utils/error");
var _errors = require("../../../server/errors");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Fetches OIDC configuration from the well-known endpoint
 * @param issuerUrl The OIDC issuer URL
 * @returns Promise resolving to the OIDC configuration
 */
async function fetchOIDCConfiguration(issuerUrl) {
  try {
    const wellKnownPath = "/.well-known/openid-configuration";
    let wellKnownUrl;

    // If the issuer URL already includes the well-known path, use it as-is
    if (issuerUrl.includes(wellKnownPath)) {
      wellKnownUrl = issuerUrl;
    } else {
      // Properly append well-known path to the issuer URL path
      const url = new URL(issuerUrl);
      // If pathname doesn't end with slash, append the full wellKnownPath (with leading slash)
      if (!url.pathname.endsWith("/")) {
        url.pathname += wellKnownPath;
      } else {
        // If pathname ends with slash, append wellKnownPath without leading slash
        url.pathname += wellKnownPath.substring(1);
      }
      wellKnownUrl = url.toString();
    }
    _Logger.default.info("plugins", `Fetching OIDC configuration from ${wellKnownUrl}`);
    const response = await (0, _fetch.default)(wellKnownUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      timeout: 10000,
      // 10 second timeout
      allowPrivateIPAddress: true
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch OIDC configuration: ${response.status} ${response.statusText}`);
    }
    const config = await response.json();

    // Validate required endpoints are present
    if (!config.authorization_endpoint) {
      throw (0, _errors.InternalError)("Missing authorization_endpoint in OIDC configuration");
    }
    if (!config.token_endpoint) {
      throw (0, _errors.InternalError)("Missing token_endpoint in OIDC configuration");
    }
    if (!config.userinfo_endpoint) {
      throw (0, _errors.InternalError)("Missing userinfo_endpoint in OIDC configuration");
    }
    _Logger.default.info("plugins", "Successfully fetched OIDC configuration", {
      issuer: config.issuer,
      authorization_endpoint: config.authorization_endpoint,
      token_endpoint: config.token_endpoint,
      userinfo_endpoint: config.userinfo_endpoint
    });
    return config;
  } catch (error) {
    _Logger.default.error("Failed to fetch OIDC configuration", (0, _error.toError)(error));
    throw error;
  }
}