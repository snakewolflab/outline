"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplatesUpdateSchema = exports.TemplatesListSchema = exports.TemplatesInfoSchema = exports.TemplatesDuplicateSchema = exports.TemplatesDeleteSchema = exports.TemplatesCreateSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
var _zod2 = require("../../../utils/zod");
var _validation = require("../../../validation");
const TemplatesSortParamsSchema = _zod.z.object({
  /** Specifies the attributes by which templates will be sorted in the list */
  sort: _zod.z.string().refine(val => ["createdAt", "updatedAt", "publishedAt", "title", "collectionId"].includes(val)).default("updatedAt"),
  /** Specifies the sort order with respect to sort field */
  direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
});
const TemplatesListSchema = exports.TemplatesListSchema = _schema.BaseSchema.extend({
  body: TemplatesSortParamsSchema.extend({
    /** Id of the collection to which the template belongs */
    collectionId: _zod.z.string().uuid().optional()
  })
});
const TemplatesCreateSchema = exports.TemplatesCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    collectionId: _zod.z.string().uuid().optional(),
    title: _zod.z.string().min(1).max(255),
    data: (0, _schema.ProsemirrorSchema)(),
    icon: (0, _zod2.zodIconType)().nullish(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish()
  })
});
const TemplatesInfoSchema = exports.TemplatesInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: (0, _zod2.zodIdType)()
  })
});
const TemplatesDeleteSchema = exports.TemplatesDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: (0, _zod2.zodIdType)()
  })
});
const TemplatesDuplicateSchema = exports.TemplatesDuplicateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: (0, _zod2.zodIdType)(),
    title: _zod.z.string().optional(),
    collectionId: _zod.z.string().uuid().nullish()
  })
});
const TemplatesUpdateSchema = exports.TemplatesUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: (0, _zod2.zodIdType)(),
    title: _zod.z.string().optional(),
    data: (0, _schema.ProsemirrorSchema)().optional(),
    icon: (0, _zod2.zodIconType)().nullish(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    fullWidth: _zod.z.boolean().optional(),
    collectionId: _zod.z.string().uuid().nullish()
  })
});