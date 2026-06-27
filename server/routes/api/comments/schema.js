"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommentsUpdateSchema = exports.CommentsUnresolveSchema = exports.CommentsResolveSchema = exports.CommentsReactionSchema = exports.CommentsListSchema = exports.CommentsInfoSchema = exports.CommentsDeleteSchema = exports.CommentsCreateSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _editor = require("../../../editor");
var _schema = require("../schema");
var _zod2 = require("../../../utils/zod");
const BaseIdSchema = _zod.z.object({
  /** Comment Id */
  id: _zod.z.uuid()
});
const CommentsSortParamsSchema = _zod.z.object({
  /** Specifies the attributes by which comments will be sorted in the list */
  sort: _zod.z.string().refine(val => ["createdAt", "updatedAt"].includes(val)).prefault("createdAt"),
  /** Specifies the sort order with respect to sort field */
  direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
});
const CommentsCreateSchema = exports.CommentsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Allow creation with a specific ID */
    id: _zod.z.uuid().optional(),
    /** Create comment for this document */
    documentId: _zod.z.uuid(),
    /** Create comment under this parent */
    parentCommentId: _zod.z.uuid().optional(),
    /** Create comment with this data */
    data: (0, _schema.ProsemirrorSchema)({
      schema: _editor.commentSchema
    }).optional(),
    /** Create comment with this text */
    text: _zod.z.string().optional(),
    /**
     * Plain text substring to anchor the comment to as an inline comment.
     * The first occurrence in the document's plain text is used.
     */
    anchorText: _zod.z.string().optional(),
    /**
     * Plain text immediately preceding `anchorText` in the document, used
     * to select a specific occurrence when `anchorText` is ambiguous.
     */
    anchorPrefix: _zod.z.string().optional(),
    /**
     * Plain text immediately following `anchorText` in the document, used
     * to select a specific occurrence when `anchorText` is ambiguous.
     */
    anchorSuffix: _zod.z.string().optional()
  }).refine(obj => !((0, _compat.isEmpty)(obj.data) && (0, _compat.isEmpty)(obj.text)), {
    error: "One of data or text is required"
  }).refine(obj => !((obj.anchorPrefix || obj.anchorSuffix) && !obj.anchorText), {
    error: "anchorPrefix and anchorSuffix require anchorText"
  })
});
const CommentsUpdateSchema = exports.CommentsUpdateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Update comment with this data */
    data: (0, _schema.ProsemirrorSchema)({
      schema: _editor.commentSchema
    })
  })
});
const CommentsDeleteSchema = exports.CommentsDeleteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CommentsListSchema = exports.CommentsListSchema = _schema.BaseSchema.extend({
  body: CommentsSortParamsSchema.extend({
    /** Id of a document to list comments for */
    documentId: _zod.z.string().optional(),
    /** Id of a collection to list comments for */
    collectionId: _zod.z.string().optional(),
    /** Id of a parent comment to list comments for */
    parentCommentId: _zod.z.uuid().optional(),
    /** Comment statuses to include in results */
    statusFilter: _zod.z.enum(_types.CommentStatusFilter).array().optional(),
    /** Whether to include anchor text, if it exists */
    includeAnchorText: _zod.z.boolean().optional()
  })
});
const CommentsInfoSchema = exports.CommentsInfoSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** Whether to include anchor text, if it exists */
    includeAnchorText: _zod.z.boolean().optional()
  })
});
const CommentsResolveSchema = exports.CommentsResolveSchema = _zod.z.object({
  body: BaseIdSchema
});
const CommentsUnresolveSchema = exports.CommentsUnresolveSchema = _zod.z.object({
  body: BaseIdSchema
});
const CommentsReactionSchema = exports.CommentsReactionSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /**  Emoji that's added to (or) removed from a comment as a reaction. */
    emoji: (0, _zod2.zodEmojiType)()
  })
});