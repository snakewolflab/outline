"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uninstall = uninstall;
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _linear = require("./linear");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function uninstall(integration) {
  if (integration.service !== _types.IntegrationService.Linear) {
    return;
  }
  const authentication = await integration.$get("authentication");
  if (!authentication) {
    return;
  }
  try {
    await _linear.Linear.revokeAccess(authentication.token);
  } catch (err) {
    // suppress error since this is a best-effort operation.
    _Logger.default.error("Failed to revoke Linear access token", (0, _error.toError)(err));
  }
}