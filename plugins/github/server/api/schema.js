"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SetupAction = exports.GitHubCallbackSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _schema = require("../../../../server/routes/api/schema");
let SetupAction = exports.SetupAction = /*#__PURE__*/function (SetupAction) {
  SetupAction["install"] = "install";
  SetupAction["request"] = "request";
  return SetupAction;
}({});
const GitHubCallbackSchema = exports.GitHubCallbackSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string().nullish(),
    state: _zod.z.string(),
    error: _zod.z.string().nullish(),
    installation_id: _zod.z.coerce.number().optional(),
    setup_action: _zod.z.enum(SetupAction)
  }).refine(req => !((0, _compat.isEmpty)(req.code) && (0, _compat.isEmpty)(req.error)), {
    error: "one of code or error is required"
  }).refine(req => (0, _compat.isEmpty)(req.code) || (0, _compat.isEmpty)(req.error), {
    error: "code and error cannot both be present"
  }).refine(req => !(req.setup_action === SetupAction.install && (0, _compat.isUndefined)(req.installation_id)), {
    error: "installation_id is required for installation"
  })
});