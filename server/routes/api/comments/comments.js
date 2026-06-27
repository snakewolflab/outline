"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _uuid = require("uuid");
var _types = require("../../../../shared/types");
var _icon = require("../../../../shared/utils/icon");
var _editor = require("../../../editor");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _feature = require("../../../middlewares/feature");
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _errors = require("../../../errors");
var _models = require("../../../models");
var _ProsemirrorHelper = require("../../../models/helpers/ProsemirrorHelper");
var _TextHelper = require("../../../models/helpers/TextHelper");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("comments.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    documentId,
    parentCommentId,
    anchorText,
    anchorPrefix,
    anchorSuffix
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  if (anchorText) {
    // Acquire the row lock on the document directly when anchoring so a
    // concurrent inline comment can't overwrite our state update.
    await _models.Document.unscoped().findOne({
      where: {
        id: documentId
      },
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE
    });
  }
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    transaction,
    // We only need to load the state binary if applying a comment mark
    includeState: !!anchorText
  });
  (0, _policies.authorize)(user, "comment", document);
  const text = ctx.input.body.text ? await _TextHelper.TextHelper.replaceImagesWithAttachments(ctx, ctx.input.body.text, user) : undefined;
  const data = text ? _editor.commentParser.parse(text).toJSON() : ctx.input.body.data;
  const commentId = id || (0, _uuid.v4)();
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
    await document.update({
      state: updatedState
    }, {
      transaction,
      hooks: false,
      silent: true
    });
  }
  const comment = await _models.Comment.createWithCtx(ctx, {
    id: commentId,
    data,
    createdById: user.id,
    documentId,
    parentCommentId
  });
  comment.createdBy = user;
  ctx.body = {
    data: (0, _presenters.presentComment)(comment),
    policies: (0, _presenters.presentPolicies)(user, [comment])
  };
});
router.post("comments.info", (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsInfoSchema), async ctx => {
  const {
    id,
    includeAnchorText
  } = ctx.input.body;
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
  comment.document = document;
  ctx.body = {
    data: (0, _presenters.presentComment)(comment, {
      includeAnchorText
    }),
    policies: (0, _presenters.presentPolicies)(user, [comment])
  };
});
router.post("comments.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsListSchema), async ctx => {
  const {
    sort,
    direction,
    documentId,
    parentCommentId,
    statusFilter,
    collectionId,
    includeAnchorText
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
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
  const where = {
    [_sequelize.Op.and]: []
  };
  if (documentId) {
    // @ts-expect-error ignore
    where[_sequelize.Op.and].push({
      documentId
    });
  }
  if (parentCommentId) {
    // @ts-expect-error ignore
    where[_sequelize.Op.and].push({
      parentCommentId
    });
  }
  if (statusQuery.length) {
    // @ts-expect-error ignore
    where[_sequelize.Op.and].push({
      [_sequelize.Op.or]: statusQuery
    });
  }
  const params = {
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  };
  let comments, total;
  if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", document);
    [comments, total] = await Promise.all([_models.Comment.findAll(params), _models.Comment.count({
      where
    })]);
    comments.forEach(comment => comment.document = document);
  } else if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", collection);
    const include = [{
      model: _models.Document,
      required: true,
      where: {
        teamId: user.teamId,
        collectionId
      }
    }];
    [comments, total] = await Promise.all([_models.Comment.findAll({
      include,
      ...params
    }), _models.Comment.count({
      include,
      where
    })]);
  } else {
    const accessibleCollectionIds = await user.collectionIds();
    const include = [{
      model: _models.Document,
      required: true,
      where: {
        teamId: user.teamId,
        collectionId: {
          [_sequelize.Op.in]: accessibleCollectionIds
        }
      }
    }];
    [comments, total] = await Promise.all([_models.Comment.findAll({
      include,
      ...params
    }), _models.Comment.count({
      include,
      where
    })]);
  }
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: comments.map(comment => (0, _presenters.presentComment)(comment, {
      includeAnchorText
    })),
    policies: (0, _presenters.presentPolicies)(user, comments)
  };
});
router.post("comments.update", (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    data
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "update", comment);
  (0, _policies.authorize)(user, "comment", document);
  let newMentionIds = [];
  if (data !== undefined) {
    const existingMentionIds = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.User
    }).map(mention => mention.id);
    const updatedMentionIds = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(data), {
      type: _types.MentionType.User
    }).map(mention => mention.id);
    const existingGroupMentionIds = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.Group
    }).map(mention => mention.id);
    const updatedGroupMentionIds = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(data), {
      type: _types.MentionType.Group
    }).map(mention => mention.id);
    newMentionIds = [...(0, _compat.difference)(updatedMentionIds, existingMentionIds), ...(0, _compat.difference)(updatedGroupMentionIds, existingGroupMentionIds)];
    comment.data = data;
  }
  await comment.saveWithCtx(ctx, undefined, {
    data: {
      newMentionIds
    }
  });
  ctx.body = {
    data: (0, _presenters.presentComment)(comment),
    policies: (0, _presenters.presentPolicies)(user, [comment])
  };
});
router.post("comments.delete", (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "delete", comment);
  (0, _policies.authorize)(user, "comment", document);
  await comment.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("comments.resolve", (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsResolveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "resolve", comment);
  (0, _policies.authorize)(user, "update", document);
  comment.resolve(user);
  await comment.saveWithCtx(ctx, {
    silent: true
  });
  ctx.body = {
    data: (0, _presenters.presentComment)(comment),
    policies: (0, _presenters.presentPolicies)(user, [comment])
  };
});
router.post("comments.unresolve", (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsUnresolveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "unresolve", comment);
  (0, _policies.authorize)(user, "update", document);
  comment.unresolve();
  await comment.saveWithCtx(ctx, {
    silent: true
  });
  ctx.body = {
    data: (0, _presenters.presentComment)(comment),
    policies: (0, _presenters.presentPolicies)(user, [comment])
  };
});
router.post("comments.add_reaction", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsReactionSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    emoji
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "comment", document);
  (0, _policies.authorize)(user, "addReaction", comment);
  if ((0, _icon.determineIconType)(emoji) === _types.IconType.Custom) {
    const customEmoji = await _models.Emoji.findByPk(emoji, {
      transaction
    });
    (0, _policies.authorize)(user, "read", customEmoji);
  }
  await _models.Reaction.findOrCreateWithCtx(ctx, {
    where: {
      emoji,
      userId: user.id,
      commentId: id
    }
  }, {
    persist: false
  });
  ctx.body = {
    success: true
  };
});
router.post("comments.remove_reaction", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _feature.commentingEnabled)(), (0, _validate.default)(T.CommentsReactionSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    emoji
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const comment = await _models.Comment.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Comment
    }
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "comment", document);
  (0, _policies.authorize)(user, "removeReaction", comment);
  const reaction = await _models.Reaction.findOne({
    where: {
      emoji,
      userId: user.id,
      commentId: id
    },
    transaction
  });
  (0, _policies.authorize)(user, "delete", reaction);
  await reaction.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;