"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FigmaCallbackSchema = void 0;
var _schema = require("../../../../server/routes/api/schema");
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
const FigmaCallbackSchema = exports.FigmaCallbackSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string().nullish(),
    state: _zod.z.string(),
    error: _zod.z.string().nullish()
  }).refine(req => !((0, _compat.isEmpty)(req.code) && (0, _compat.isEmpty)(req.error)), {
    error: "one of code or error is required"
  }).refine(req => (0, _compat.isEmpty)(req.code) || (0, _compat.isEmpty)(req.error), {
    error: "code and error cannot both be present"
  })
});