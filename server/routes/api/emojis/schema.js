"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojisUpdateSchema = exports.EmojisRedirectSchema = exports.EmojisListSchema = exports.EmojisInfoSchema = exports.EmojisDeleteSchema = exports.EmojisCreateSchema = void 0;
var _zod = require("zod");
var _validations = require("../../../../shared/validations");
var _schema = require("../schema");
var _zod2 = require("../../../utils/zod");
const EmojisInfoSchema = exports.EmojisInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** ID of the emoji to fetch */
    id: _zod.z.uuid().optional(),
    /** Name of the emoji to fetch */
    name: _zod.z.string().min(1).max(_validations.EmojiValidation.maxNameLength).optional()
  }).refine(data => data.id || data.name, {
    error: "Either id or name is required"
  })
});
const EmojisListSchema = exports.EmojisListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    query: _zod.z.string().optional()
  })
});
const EmojisCreateSchema = exports.EmojisCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Name/shortcode for the emoji (e.g., "awesome") */
    name: _zod.z.string().min(1).max(_validations.EmojiValidation.maxNameLength),
    /** URL to the emoji image */
    attachmentId: _zod.z.uuid()
  })
});
const EmojisUpdateSchema = exports.EmojisUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** ID of the emoji to update */
    id: _zod.z.uuid(),
    /** ID of the new attachment to use as the emoji image */
    attachmentId: _zod.z.uuid()
  })
});
const EmojisDeleteSchema = exports.EmojisDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** ID of the emoji to delete */
    id: _zod.z.uuid()
  })
});
const EmojisRedirectSchema = exports.EmojisRedirectSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    /** Id of the emoji */
    id: _zod.z.uuid(),
    /** Share Id, if available */
    shareId: (0, _zod2.zodShareIdType)().optional()
  })
});