"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchesUpdateSchema = exports.SearchesListSchema = exports.SearchesDeleteSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _schema = require("../schema");
const SearchesDeleteSchema = exports.SearchesDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid().optional(),
    query: _zod.z.string().optional()
  })
}).refine(req => !((0, _compat.isEmpty)(req.body.id) && (0, _compat.isEmpty)(req.body.query)), {
  message: "id or query is required"
});
const SearchesUpdateSchema = exports.SearchesUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    score: _zod.z.number().min(-1).max(1)
  })
});
const SearchesListSchema = exports.SearchesListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    source: _zod.z.string().optional()
  }).optional()
});