"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RevisionsUpdateSchema = exports.RevisionsListSchema = exports.RevisionsInfoSchema = exports.RevisionsExportSchema = exports.RevisionsDeleteSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _validations = require("../../../../shared/validations");
var _models = require("../../../models");
var _schema = require("../schema");
const RevisionsInfoSchema = exports.RevisionsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid().optional(),
    documentId: _zod.z.uuid().optional()
  }).refine(req => !((0, _compat.isEmpty)(req.id) && (0, _compat.isEmpty)(req.documentId)), {
    error: "id or documentId is required"
  })
});
const RevisionsUpdateSchema = exports.RevisionsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    name: _zod.z.string().min(_validations.RevisionValidation.minNameLength).max(_validations.RevisionValidation.maxNameLength).or(_zod.z.null())
  })
});
const RevisionsListSchema = exports.RevisionsListSchema = _zod.z.object({
  body: _zod.z.object({
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    sort: _zod.z.string().refine(val => Object.keys(_models.Revision.getAttributes()).includes(val), {
      error: "Invalid sort parameter"
    }).prefault("createdAt"),
    documentId: _zod.z.uuid()
  })
});
const RevisionsDeleteSchema = exports.RevisionsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});
const RevisionsExportSchema = exports.RevisionsExportSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});