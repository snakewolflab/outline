"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentTools = commentTools;
var _uuid = require("uuid");
var _zod = require("zod");
var _sequelize = require("sequelize");
var _database = require("../storage/database");
var _types = require("../../shared/types");
var _editor = require("../editor");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _models = require("../models");
var _policies = require("../policies");
var _presenters = require("../presenters");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _util = require("./util");
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Presents a comment with a plain-text rendering of its content so that
 * MCP consumers (typically AI agents) can read it without parsing
 * ProseMirror JSON.
 *
 * @param comment - the comment model instance.
 * @param commentMarks - optional precomputed comment marks to avoid reparsing.
 * @returns the presented comment with an additional `text` field.
 */
function presentCommentWithText(comment, commentMarks) {
  const presented = (0, _presenters.presentComment)(comment, {
    includeAnchorText: true,
    commentMarks
  });
  return {
    ...presented,
    text: comment.toPlainText()
  };
}

/**
 * Registers comment-related MCP tools on the given server, filtered by the
 * OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register tools on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function commentTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("comments.list", scopes)) {
    server.registerTool("list_comments", {
      title: "List comments",
      description: "Lists comments the user has access to. Requires at least one of documentId or collectionId. Optionally filter by parent comment or resolution status.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        documentId: (0, _util.optionalString)().describe("The document ID to list comments for."),
        collectionId: (0, _util.optionalString)().describe("The collection ID to list comments for."),
        parentCommentId: (0, _util.optionalString)().describe("A parent comment ID to list only the replies in that thread."),
        statusFilter: _zod.z.array(_zod.z.enum(_types.CommentStatusFilter)).optional().describe("Filter by resolution status: resolved, unresolved, or both."),
        offset: _zod.z.coerce.number().int().min(0).optional().describe("The pagination offset. Defaults to 0."),
        limit: _zod.z.coerce.number().int().min(1).max(100).optional().describe("The maximum number of results to return. Defaults to 25, max 100.")
      }
    }, (0, _util.withTracing)("list_comments", async (_ref, extra) => {
      let {
        documentId,
        collectionId,
        parentCommentId,
        statusFilter,
        offset,
        limit
      } = _ref;
      try {
        const user = (0, _util.getActorFromContext)(extra);
        const effectiveOffset = offset ?? 0;
        const effectiveLimit = limit ?? 25;
        const statusQuery = [];
        if (statusFilter?.includes(_types.CommentStatusFilter.Resolved)) {
          statusQuery.push({
            resolvedById: {
              [_sequelize.Op.not]: null
            }
          });
        }
        if (statusFilter?.includes(_types.CommentStatusFilter.Unresolved)) {
          statusQuery.push({
            resolvedById: null
          });
        }
        const and = [];
        if (documentId) {
          and.push({
            documentId
          });
        }
        if (parentCommentId) {
          and.push({
            parentCommentId
          });
        }
        if (statusQuery.length) {
          and.push({
            [_sequelize.Op.or]: statusQuery
          });
        }
        const where = {
          [_sequelize.Op.and]: and
        };
        const params = {
          where,
          order: [["createdAt", "DESC"]],
          offset: effectiveOffset,
          limit: effectiveLimit
        };
        let comments;
        if (documentId) {
          const document = await _models.Document.findByPk(documentId, {
            userId: user.id
          });
          (0, _policies.authorize)(user, "read", document);
          comments = await _models.Comment.findAll(params);
          comments.forEach(comment => comment.document = document);
        } else if (collectionId) {
          const collection = await _models.Collection.findByPk(collectionId, {
            userId: user.id
          });
          (0, _policies.authorize)(user, "read", collection);
          comments = await _models.Comment.findAll({
            include: [{
              model: _models.Document,
              required: true,
              where: {
                teamId: user.teamId,
                collectionId
              }
            }],
            ...params
          });
        } else {
          const accessibleCollectionIds = await user.collectionIds();
          comments = await _models.Comment.findAll({
            include: [{
              model: _models.Document,
              required: true,
              where: {
                teamId: user.teamId,
                collectionId: {
                  [_sequelize.Op.in]: accessibleCollectionIds
                }
              }
            }],
            ...params
          });
        }

        // Precompute comment marks per document to avoid reparsing
        // the same document for every comment.
        const marksCache = new Map();
        const presented = comments.map(comment => {
          const doc = comment.document;
          let marks;
          if (doc) {
            if (!marksCache.has(doc.id)) {
              marksCache.set(doc.id, _ProsemirrorHelper.ProsemirrorHelper.getComments(_DocumentHelper.DocumentHelper.toProsemirror(doc)));
            }
            marks = marksCache.get(doc.id);
          }
          return presentCommentWithText(comment, marks);
        });
        return (0, _util.success)(presented);
      } catch (err) {
        return (0, _util.error)(err);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("comments.create", scopes)) {
    server.registerTool("create_comment", {
      title: "Create comment",
      description: "Creates a new comment on a document. Provide the comment content as markdown text. Optionally nest it as a reply under an existing comment.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        documentId: _zod.z.string().describe("The document ID to comment on."),
        text: _zod.z.string().describe("The markdown text content of the comment."),
        parentCommentId: (0, _util.optionalString)().describe("The parent comment ID to reply to. Omit for a top-level comment."),
        anchorText: (0, _util.optionalString)().describe("A plain text substring of the document to anchor this comment to as an inline comment. The first occurrence is used unless anchorPrefix or anchorSuffix is provided, omit for a general document comment."),
        anchorPrefix: (0, _util.optionalString)().describe("Only provide this if anchorText appears more than once in the document and you need to target a specific occurrence. Plain text that immediately precedes anchorText."),
        anchorSuffix: (0, _util.optionalString)().describe("Only provide this if anchorText appears more than once in the document and you need to target a specific occurrence. Plain text that immediately follows anchorText.")
      }
    }, (0, _util.withTracing)("create_comment", async (_ref2, context) => {
      let {
        documentId,
        text,
        parentCommentId,
        anchorText,
        anchorPrefix,
        anchorSuffix
      } = _ref2;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const data = _editor.commentParser.parse(text).toJSON();
        const commentId = (0, _uuid.v4)();
        const comment = await _database.sequelize.transaction(async transaction => {
          ctx.state.transaction = transaction;
          ctx.context.transaction = transaction;
          if (anchorText) {
            // Acquire the row lock on the document directly when
            // anchoring so a concurrent comment-mark application can't
            // overwrite our state update.
            await _models.Document.unscoped().findOne({
              where: {
                id: documentId
              },
              attributes: ["id"],
              transaction,
              lock: _sequelize.Transaction.LOCK.UPDATE
            });
          }
          const document = await _models.Document.findByPk(documentId, {
            userId: user.id,
            // We only need to load the state binary if applying a comment mark
            includeState: !!anchorText,
            transaction
          });
          (0, _policies.authorize)(user, "comment", document);
          if (anchorText) {
            if (!document.state) {
              throw (0, _errors.ValidationError)("Cannot inline comment on this document");
            }
            const updatedState = _ProsemirrorHelper.ProsemirrorHelper.applyCommentMarkByText({
              docState: document.state,
              anchorText,
              commentId,
              userId: user.id,
              prefix: anchorPrefix,
              suffix: anchorSuffix
            });
            if (!updatedState) {
              throw (0, _errors.ValidationError)("Could not anchor comment to the provided text in the document");
            }
            await document.updateWithCtx(ctx, {
              state: updatedState
            });
          }
          const created = await _models.Comment.createWithCtx(ctx, {
            id: commentId,
            data,
            createdById: user.id,
            documentId,
            parentCommentId
          });
          created.createdBy = user;
          created.document = document;
          return created;
        });
        const presented = presentCommentWithText(comment);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(presented)
          }]
        };
      } catch (err) {
        return (0, _util.error)(err);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("comments.update", scopes)) {
    server.registerTool("update_comment", {
      title: "Update comment",
      description: "Updates an existing comment by its ID. Can update the text content, resolve or unresolve the comment thread, or both. Only top-level comments (not replies) can be resolved or unresolved.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the comment to update."),
        text: _zod.z.string().optional().describe("The new markdown text content of the comment."),
        status: _zod.z.enum(["resolved", "unresolved"]).optional().describe("Set to 'resolved' to resolve or 'unresolved' to unresolve a top-level comment thread.")
      }
    }, (0, _util.withTracing)("update_comment", async (_ref3, context) => {
      let {
        id,
        text,
        status
      } = _ref3;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const comment = await _models.Comment.findByPk(id, {
          rejectOnEmpty: true
        });
        const document = await _models.Document.findByPk(comment.documentId, {
          userId: user.id
        });
        (0, _policies.authorize)(user, "read", comment);
        (0, _policies.authorize)(user, "read", document);
        if (text !== undefined) {
          (0, _policies.authorize)(user, "update", comment);
          (0, _policies.authorize)(user, "comment", document);
          const data = _editor.commentParser.parse(text).toJSON();
          comment.data = data;
        }
        if (status === "resolved") {
          (0, _policies.authorize)(user, "resolve", comment);
          (0, _policies.authorize)(user, "update", document);
          comment.resolve(user);
        } else if (status === "unresolved") {
          (0, _policies.authorize)(user, "unresolve", comment);
          (0, _policies.authorize)(user, "update", document);
          comment.unresolve();
        }
        await comment.saveWithCtx(ctx, status ? {
          silent: true
        } : undefined);
        comment.document = document;
        const presented = presentCommentWithText(comment);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(presented)
          }]
        };
      } catch (err) {
        return (0, _util.error)(err);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("comments.delete", scopes)) {
    server.registerTool("delete_comment", {
      title: "Delete comment",
      description: "Deletes a comment by its ID. The user must be the comment author or a team admin.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the comment to delete.")
      }
    }, (0, _util.withTracing)("delete_comment", async (_ref4, context) => {
      let {
        id
      } = _ref4;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const comment = await _models.Comment.findByPk(id, {
          rejectOnEmpty: true
        });
        const document = await _models.Document.findByPk(comment.documentId, {
          userId: user.id
        });
        (0, _policies.authorize)(user, "delete", comment);
        (0, _policies.authorize)(user, "comment", document);
        await comment.destroyWithCtx(ctx);
        return (0, _util.success)({
          success: true
        });
      } catch (err) {
        return (0, _util.error)(err);
      }
    }));
  }
}