"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotionSearchSchema = exports.NotionCallbackSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _schema = require("../../../../server/routes/api/schema");
const NotionCallbackSchema = exports.NotionCallbackSchema = _schema.BaseSchema.extend({
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
const NotionSearchSchema = exports.NotionSearchSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    integrationId: _zod.z.uuid()
  })
});