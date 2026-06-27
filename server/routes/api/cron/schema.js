"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CronSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _schema = require("../schema");
const CronSchema = exports.CronSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    token: _zod.z.string().optional(),
    limit: _zod.z.coerce.number().gt(0).prefault(500)
  }),
  query: _zod.z.object({
    token: _zod.z.string().optional(),
    limit: _zod.z.coerce.number().gt(0).prefault(500)
  })
}).refine(req => !((0, _compat.isEmpty)(req.body.token) && (0, _compat.isEmpty)(req.query.token)), {
  message: "token is required"
});