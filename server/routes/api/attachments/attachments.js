"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _nodeCrypto = require("node:crypto");
var _types = require("../../../../shared/types");
var _files = require("../../../../shared/utils/files");
var _env = _interopRequireDefault(require("../../../env"));
var _validations = require("../../../../shared/validations");
var _context = require("../../../context");
var _errors = require("../../../errors");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _AttachmentHelper = _interopRequireDefault(require("../../../models/helpers/AttachmentHelper"));
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _UploadAttachmentFromUrlTask = _interopRequireDefault(require("../../../queues/tasks/UploadAttachmentFromUrlTask"));
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var _database = require("../../../storage/database");
var _files2 = _interopRequireDefault(require("../../../storage/files"));
var _BaseStorage = _interopRequireDefault(require("../../../storage/files/BaseStorage"));
var _RateLimiter = require("../../../utils/RateLimiter");
var _validation = require("../../../validation");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("attachments.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.AttachmentsListSchema), async ctx => {
  const {
    documentId,
    userId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId
  };

  // If a specific user is passed then add to filters
  if (userId && user.isAdmin) {
    where.userId = userId;
  } else {
    where.userId = user.id;
  }

  // If a specific document is passed then add to filters
  if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", document);
    where.documentId = documentId;
  }
  const [attachments, total] = await Promise.all([_models.Attachment.findAll({
    where,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Attachment.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: attachments.map(_presenters.presentAttachment),
    policies: (0, _presenters.presentPolicies)(user, attachments)
  };
});
router.post("attachments.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    name,
    documentId,
    contentType,
    size,
    preset
  } = ctx.input.body;
  const {
    auth,
    transaction
  } = ctx.state;
  const {
    user
  } = auth;

  // All user types can upload an avatar so no additional authorization is needed.
  if (preset === _types.AttachmentPreset.Avatar) {
    (0, _validation.assertIn)(contentType, _validations.AttachmentValidation.avatarContentTypes);
  } else {
    if (preset === _types.AttachmentPreset.DocumentAttachment && documentId) {
      const document = await _models.Document.findByPk(documentId, {
        userId: user.id,
        transaction
      });
      (0, _policies.authorize)(user, "update", document);
    }
    if (preset === _types.AttachmentPreset.Emoji) {
      (0, _validation.assertIn)(contentType, _validations.AttachmentValidation.emojiContentTypes);
    }
    (0, _policies.authorize)(user, "createAttachment", user.team);
  }
  const maxUploadSize = _AttachmentHelper.default.presetToMaxUploadSize(preset);
  if (size > maxUploadSize) {
    throw (0, _errors.ValidationError)(`Sorry, this file is too large – the maximum size is ${(0, _files.bytesToHumanReadable)(maxUploadSize)}`);
  }
  const modelId = id ?? (0, _nodeCrypto.randomUUID)();
  const acl = _AttachmentHelper.default.presetToAcl(preset);
  const key = _AttachmentHelper.default.getKey({
    id: modelId,
    name,
    userId: user.id
  });
  const attachment = await _models.Attachment.createWithCtx(ctx, {
    id: modelId,
    key,
    acl,
    size,
    expiresAt: _AttachmentHelper.default.presetToExpiry(preset),
    contentType,
    documentId,
    teamId: user.teamId,
    userId: user.id
  });
  const usePut = _env.default.AWS_S3_UPLOAD_METHOD === "put";
  if (usePut) {
    const presignedPut = await _files2.default.getPresignedPut(key, acl, size, contentType);
    if (!presignedPut) {
      throw (0, _errors.InvalidRequestError)(`The current storage backend does not support PUT uploads. Set AWS_S3_UPLOAD_METHOD to "post" or use an S3-compatible storage provider.`);
    }
    ctx.body = {
      data: {
        mode: "put",
        url: presignedPut.url,
        headers: presignedPut.headers,
        attachment: {
          ...(0, _presenters.presentAttachment)(attachment),
          url: attachment.redirectUrl
        }
      }
    };
  } else {
    const presignedPost = await _files2.default.getPresignedPost(ctx, key, acl, maxUploadSize, contentType);
    ctx.body = {
      data: {
        mode: "post",
        uploadUrl: _files2.default.getUploadUrl(),
        form: {
          "Cache-Control": "max-age=31557600",
          "Content-Type": contentType,
          ...presignedPost.fields
        },
        attachment: {
          ...(0, _presenters.presentAttachment)(attachment),
          url: attachment.redirectUrl
        }
      }
    };
  }
});
router.post("attachments.createFromUrl", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsCreateFromUrlSchema), async ctx => {
  const {
    id,
    url,
    documentId,
    preset
  } = ctx.input.body;
  const {
    user,
    type
  } = ctx.state.auth;
  if (preset !== _types.AttachmentPreset.DocumentAttachment || !documentId) {
    throw (0, _errors.ValidationError)("Only document attachments can be created from a URL");
  }
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "update", document);
  const name = (0, _files.getFileNameFromUrl)(url) ?? "file";
  const modelId = id ?? (0, _nodeCrypto.randomUUID)();
  const acl = _AttachmentHelper.default.presetToAcl(preset);
  const key = _AttachmentHelper.default.getKey({
    id: modelId,
    name,
    userId: user.id
  });

  // Does not use transaction middleware, as attachment must be persisted
  // before the job is scheduled.
  const attachment = await _database.sequelize.transaction(async transaction => _models.Attachment.createWithCtx((0, _context.createContext)({
    authType: type,
    user,
    ip: ctx.ip,
    transaction
  }), {
    id: modelId,
    key,
    acl,
    size: 0,
    expiresAt: _AttachmentHelper.default.presetToExpiry(preset),
    contentType: "application/octet-stream",
    documentId,
    teamId: user.teamId,
    userId: user.id
  }));
  const job = await new _UploadAttachmentFromUrlTask.default().schedule({
    attachmentId: attachment.id,
    url
  });
  const response = await job.finished();
  if ("error" in response) {
    throw (0, _errors.InvalidRequestError)(response.error);
  }
  await attachment.reload();
  ctx.body = {
    data: (0, _presenters.presentAttachment)(attachment)
  };
});
router.post("attachments.delete", (0, _authentication.default)(), (0, _validate.default)(T.AttachmentDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const attachment = await _models.Attachment.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  if (attachment.documentId) {
    const document = await _models.Document.findByPk(attachment.documentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", document);
  }
  (0, _policies.authorize)(user, "delete", attachment);
  await attachment.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
const handleAttachmentsRedirect = async ctx => {
  const id = ctx.input.body.id ?? ctx.input.query.id;
  const user = ctx.state.auth?.user;
  const attachment = await _models.Attachment.findByPk(id, {
    rejectOnEmpty: true
  });

  // Private attachments are accessible to any member of the workspace they
  // belong to. This is intentional and not a permission bypass – attachments
  // are owned by the workspace (team), not by individual documents. Checking
  // document-level permissions here would be insufficient anyway as attachments
  // can exist independently of documents.
  if (attachment.isPrivate && attachment.teamId !== user?.teamId) {
    throw (0, _errors.AuthorizationError)();
  }
  await attachment.update({
    lastAccessedAt: new Date()
  }, {
    silent: true
  });
  if (attachment.isStoredInPublicBucket) {
    ctx.set("Cache-Control", `max-age=604800, immutable`);
    ctx.redirect(attachment.canonicalUrl);
  } else {
    ctx.set("Cache-Control", `max-age=${_BaseStorage.default.defaultSignedUrlExpires}, immutable`);
    ctx.redirect(await attachment.signedUrl);
  }
};
router.get("attachments.redirect", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.AttachmentsRedirectSchema), handleAttachmentsRedirect);
router.post("attachments.redirect", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.AttachmentsRedirectSchema), handleAttachmentsRedirect);
var _default = exports.default = router;