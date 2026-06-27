"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StarsUpdateSchema = exports.StarsListSchema = exports.StarsDeleteSchema = exports.StarsCreateSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _validation = require("../../../validation");
var _schema = require("../schema");
const StarsCreateSchema = exports.StarsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }).optional(),
    collectionId: _zod.z.uuid().optional(),
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    }).optional()
  }).refine(body => !((0, _compat.isEmpty)(body.documentId) && (0, _compat.isEmpty)(body.collectionId)), {
    error: "One of documentId or collectionId is required"
  })
});
const StarsListSchema = exports.StarsListSchema = _schema.BaseSchema;
const StarsUpdateSchema = exports.StarsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    })
  })
});
const StarsDeleteSchema = exports.StarsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});