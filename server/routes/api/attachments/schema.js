"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachmentsRedirectSchema = exports.AttachmentsListSchema = exports.AttachmentsCreateSchema = exports.AttachmentsCreateFromUrlSchema = exports.AttachmentDeleteSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../schema");
const AttachmentsListSchema = exports.AttachmentsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the document to which the Attachment belongs */
    documentId: _zod.z.uuid().optional(),
    /** Id of the user that uploaded the Attachment */
    userId: _zod.z.uuid().optional()
  })
});
const AttachmentsCreateSchema = exports.AttachmentsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Attachment id */
    id: _zod.z.uuid().optional(),
    /** Attachment name */
    name: _zod.z.string(),
    /** Id of the document to which the Attachment belongs */
    documentId: _zod.z.uuid().optional(),
    /** File size of the Attachment */
    size: _zod.z.number().int().nonnegative(),
    /** Content-Type of the Attachment */
    contentType: _zod.z.string().optional().prefault("application/octet-stream"),
    /** Attachment type */
    preset: _zod.z.enum(_types.AttachmentPreset).prefault(_types.AttachmentPreset.DocumentAttachment)
  })
});
const AttachmentsCreateFromUrlSchema = exports.AttachmentsCreateFromUrlSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Attachment id */
    id: _zod.z.uuid().optional(),
    /** Attachment url */
    url: _zod.z.string(),
    /** Id of the document to which the Attachment belongs */
    documentId: _zod.z.uuid().optional(),
    /** Attachment type */
    preset: _zod.z.enum(_types.AttachmentPreset).prefault(_types.AttachmentPreset.DocumentAttachment)
  })
});
const AttachmentDeleteSchema = exports.AttachmentDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.uuid()
  })
});
const AttachmentsRedirectSchema = exports.AttachmentsRedirectSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.uuid().optional()
  }),
  query: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.uuid().optional()
  })
}).refine(req => !((0, _compat.isEmpty)(req.body.id) && (0, _compat.isEmpty)(req.query.id)), {
  message: "id is required"
});