"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectionName = void 0;
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * For debugging. The connection name is based on the services running in
 * this process. Note that this does not need to be unique.
 */
const getConnectionName = connectionNameSuffix => {
  const connectionNamePrefix = _env.default.isDevelopment ? process.pid : "outline";
  return `${connectionNamePrefix}:${_env.default.SERVICES.join("-")}` + (connectionNameSuffix ? `:${connectionNameSuffix}` : "");
};
exports.getConnectionName = getConnectionName;