"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelationshipsListSchema = exports.RelationshipsInfoSchema = void 0;
var _zod = require("zod");
var _Relationship = require("../../../models/Relationship");
var _validation = require("../../../validation");
var _schema = require("../schema");
const RelationshipsInfoSchema = exports.RelationshipsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});
const RelationshipsListSchema = exports.RelationshipsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    type: _zod.z.enum(_Relationship.RelationshipType).optional(),
    documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }).optional(),
    reverseDocumentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }).optional()
  }).optional()
});