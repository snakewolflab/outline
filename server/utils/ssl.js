"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSSLOptions = getSSLOptions;
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Find if SSL certs are available in the environment or filesystem and return
 * as a valid ServerOptions object
 */
function getSSLOptions() {
  function safeReadFile(name) {
    try {
      return _nodeFs.default.readFileSync(_nodePath.default.normalize(`${__dirname}/../../../${name}`), "utf8");
    } catch (_err) {
      return undefined;
    }
  }
  try {
    return {
      key: (_env.default.SSL_KEY ? Buffer.from(_env.default.SSL_KEY, "base64").toString("ascii") : undefined) || safeReadFile("private.key") || safeReadFile("private.pem") || safeReadFile("server/config/certs/private.key"),
      cert: (_env.default.SSL_CERT ? Buffer.from(_env.default.SSL_CERT, "base64").toString("ascii") : undefined) || safeReadFile("public.cert") || safeReadFile("public.pem") || safeReadFile("server/config/certs/public.cert")
    };
  } catch (_err) {
    return {
      key: undefined,
      cert: undefined
    };
  }
}