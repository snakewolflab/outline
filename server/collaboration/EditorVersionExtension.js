"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorVersionExtension = void 0;
var _semver = _interopRequireDefault(require("semver"));
var _CloseEvents = require("../../shared/collaboration/CloseEvents");
var _version = _interopRequireDefault(require("../../shared/editor/version"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let EditorVersionExtension = exports.EditorVersionExtension = (_dec = (0, _tracing.trace)(), _dec(_class = class EditorVersionExtension {
  /**
   * On connect hook – prevents connections from clients with an outdated editor
   * version. See the equivalent logic for API in /server/routes/api/middlewares/editor.ts
   *
   * @param data The connect payload
   * @returns Promise, resolving will allow the connection, rejecting will drop.
   */
  onConnect(_ref) {
    let {
      requestParameters
    } = _ref;
    const clientVersion = requestParameters.get("editorVersion");
    if (!clientVersion) {
      _Logger.default.debug("multiplayer", "Dropping connection due to missing editor version");
      return Promise.reject(_CloseEvents.EditorUpdateError);
    }
    const parsedClientVersion = _semver.default.parse(clientVersion);
    const parsedServerVersion = _semver.default.parse(_version.default);
    if (parsedClientVersion && parsedServerVersion && parsedClientVersion.major < parsedServerVersion.major) {
      _Logger.default.debug("multiplayer", `Dropping connection due to outdated editor version: ${clientVersion} < ${_version.default}`);
      return Promise.reject(_CloseEvents.EditorUpdateError);
    }
    return Promise.resolve();
  }
}) || _class);