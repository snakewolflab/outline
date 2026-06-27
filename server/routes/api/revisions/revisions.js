"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _contentDisposition = _interopRequireDefault(require("content-disposition"));
var _compat = require("es-toolkit/compat");
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _RevisionHelper = require("../../../../shared/utils/RevisionHelper");
var _slugify = _interopRequireDefault(require("../../../../shared/utils/slugify"));
var _errors = require("../../../errors");
var _Logger = _interopRequireDefault(require("../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _DocumentHelper = require("../../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../../models/helpers/ProsemirrorHelper");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _koa = require("../../../utils/koa");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("revisions.info", (0, _authentication.default)(), (0, _validate.default)(T.RevisionsInfoSchema), async ctx => {
  const {
    id,
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let revision;
  if (id) {
    revision = await _models.Revision.findByPk(id, {
      rejectOnEmpty: true
    });
    const document = await _models.Document.findByPk(revision.documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "listRevisions", document);
  } else if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "listRevisions", document);
    revision = _models.Revision.buildFromDocument(document);
    revision.id = _RevisionHelper.RevisionHelper.latestId(document.id);
    revision.user = document.updatedBy;
  } else {
    throw (0, _errors.ValidationError)("Either id or documentId must be provided");
  }
  ctx.body = {
    data: await (0, _presenters.presentRevision)(revision),
    policies: (0, _presenters.presentPolicies)(user, [revision])
  };
});
router.post("revisions.update", (0, _authentication.default)(), (0, _validate.default)(T.RevisionsUpdateSchema), async ctx => {
  const {
    id,
    name
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const revision = await _models.Revision.findByPk(id, {
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(revision.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "update", document);
  (0, _policies.authorize)(user, "update", revision);
  revision.name = name;
  await revision.save();
  ctx.body = {
    data: await (0, _presenters.presentRevision)(revision),
    policies: (0, _presenters.presentPolicies)(user, [revision])
  };
});
router.post("revisions.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.RevisionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const revision = await _models.Revision.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: {
      of: _models.Revision,
      level: transaction.LOCK.UPDATE
    }
  });
  const document = await _models.Document.findByPk(revision.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);
  (0, _policies.authorize)(user, "delete", revision);
  await revision.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("revisions.export", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.RevisionsExportSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const accept = ctx.request.headers["accept"];
  const revision = await _models.Revision.findByPk(id, {
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(revision.documentId, {
    userId: user.id,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "listRevisions", document);
  let contentType;
  let content;
  if (accept?.includes("text/html")) {
    contentType = "text/html";
    content = await _DocumentHelper.DocumentHelper.toHTML(revision, {
      centered: true,
      includeMermaid: true
    });
  } else if (accept?.includes("application/pdf")) {
    throw (0, _errors.IncorrectEditionError)("PDF export is not available in the community edition");
  } else if (accept?.includes("text/markdown")) {
    contentType = "text/markdown";
    content = await _DocumentHelper.DocumentHelper.toMarkdown(revision);
  } else {
    ctx.body = {
      data: await _DocumentHelper.DocumentHelper.toMarkdown(revision)
    };
    return;
  }

  // Override the extension for Markdown as it's incorrect in the mime-types
  // library until a new release > 2.1.35
  const extension = contentType === "text/markdown" ? "md" : _mimeTypes.default.extension(contentType);
  const fileName = (0, _slugify.default)(revision.title);
  const attachmentIds = _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(revision));
  const attachments = attachmentIds.length ? await _models.Attachment.findAll({
    where: {
      teamId: document.teamId,
      id: attachmentIds
    }
  }) : [];
  if (attachments.length === 0) {
    ctx.set("Content-Type", contentType);
    ctx.set("Content-Disposition", (0, _contentDisposition.default)(`${fileName}.${extension}`, {
      type: "attachment"
    }));
    ctx.body = content;
    return;
  }
  await (0, _koa.streamZipResponse)(ctx, `${fileName}.zip`, async zip => {
    for (const attachment of attachments) {
      const location = _nodePath.default.join("attachments", `${attachment.id}.${_mimeTypes.default.extension(attachment.contentType)}`);
      let buffer;
      try {
        buffer = await attachment.buffer;
      } catch (err) {
        _Logger.default.warn(`Failed to read attachment from storage`, {
          attachmentId: attachment.id,
          teamId: attachment.teamId,
          error: (0, _error.errToString)(err)
        });
        buffer = Buffer.from("");
      }
      zip.addBuffer(buffer, location, {
        mtime: attachment.updatedAt
      });
      content = content.replace(new RegExp((0, _compat.escapeRegExp)(attachment.redirectUrl), "g"), location);
    }
    zip.addBuffer(Buffer.from(content), `${fileName}.${extension}`, {
      mtime: revision.updatedAt
    });
  });
});
router.post("revisions.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.RevisionsListSchema), async ctx => {
  const {
    direction,
    documentId,
    sort
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    paranoid: false
  });
  (0, _policies.authorize)(user, "listRevisions", document);
  const revisions = await _models.Revision.findAll({
    where: {
      documentId: document.id
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    paranoid: false
  });
  const data = await Promise.all(revisions.map(revision => (0, _presenters.presentRevision)(revision)));
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies: (0, _presenters.presentPolicies)(user, revisions)
  };
});
var _default = exports.default = router;