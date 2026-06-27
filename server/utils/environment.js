"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.resolveFileSecrets = resolveFileSecrets;
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _dotenvx = _interopRequireDefault(require("@dotenvx/dotenvx"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let environment = {};
const envPath = _nodePath.default.resolve(process.cwd(), `.env`);
const envDefault = _nodeFs.default.existsSync(envPath) ? _dotenvx.default.parse(_nodeFs.default.readFileSync(envPath, "utf8")) : {};

// Load environment specific variables, in reverse order of precedence
const environments = ["production", "development", "local", "test"];
for (const env of environments) {
  const isEnv = process.env.NODE_ENV === env || envDefault.NODE_ENV === env;
  const isLocalDevelopment = env === "local" && (process.env.NODE_ENV === "development" || envDefault.NODE_ENV === "development");
  if (isEnv || isLocalDevelopment) {
    const resolvedPath = _nodePath.default.resolve(process.cwd(), `.env.${env}`);
    if (_nodeFs.default.existsSync(resolvedPath)) {
      environment = {
        ...environment,
        ..._dotenvx.default.parse(_nodeFs.default.readFileSync(resolvedPath, "utf8"))
      };
    }
  }
}
process.env = {
  ...envDefault,
  ...environment,
  ...process.env
};

/**
 * Process environment variables with _FILE suffix by reading the referenced
 * file and setting the base variable. If the base variable is already set, the
 * file is not read. File contents are trimmed of leading/trailing whitespace.
 *
 * @param env - the environment record to process.
 */
function resolveFileSecrets(env) {
  for (const key of Object.keys(env)) {
    if (key.endsWith("_FILE")) {
      const baseKey = key.slice(0, -5);
      if (!baseKey.length) {
        continue;
      }
      const filePath = env[key];
      if (!filePath) {
        continue;
      }
      if (env[baseKey] !== undefined) {
        continue;
      }
      try {
        env[baseKey] = _nodeFs.default.readFileSync(filePath, "utf8").trim();
      } catch (err) {
        // oxlint-disable-next-line no-console
        console.error(`Failed to read file for ${key} (${filePath}): ${err.message}`);
      }
    }
  }
}
resolveFileSecrets(process.env);
var _default = exports.default = process.env;