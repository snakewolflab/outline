"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editor;
var _semver = _interopRequireDefault(require("semver"));
var _version = _interopRequireDefault(require("../../../../shared/editor/version"));
var _errors = require("../../../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function editor() {
  /**
   * Middleware to prevent connections from clients with an outdated editor
   * version. See the equivalent logic for collab server in:
   * /server/collaboration/EditorVersionExtension.ts
   */
  return async function editorMiddleware(ctx, next) {
    const clientVersion = ctx.headers["x-editor-version"];
    if (clientVersion) {
      const parsedClientVersion = _semver.default.parse(clientVersion);
      const parsedCurrentVersion = _semver.default.parse(_version.default);
      if (parsedClientVersion && parsedCurrentVersion && parsedClientVersion.major < parsedCurrentVersion.major) {
        throw (0, _errors.EditorUpdateError)();
      }
    }
    return next();
  };
}