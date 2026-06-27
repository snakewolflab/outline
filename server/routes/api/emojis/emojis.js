"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _BaseStorage = _interopRequireDefault(require("../../../storage/files/BaseStorage"));
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
var _passport = require("../../../utils/passport");
var _shareLoader = require("../../../commands/shareLoader");
var _errors = require("../../../errors");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("emojis.info", (0, _authentication.default)(), (0, _validate.default)(T.EmojisInfoSchema), async ctx => {
  const {
    id,
    name
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const include = [{
    model: _models.User,
    as: "createdBy",
    paranoid: false
  }, {
    model: _models.Attachment,
    as: "attachment",
    paranoid: false
  }];
  let emoji;
  if (id) {
    emoji = await _models.Emoji.findByPk(id, {
      rejectOnEmpty: true,
      include
    });
  } else if (name) {
    emoji = await _models.Emoji.findOne({
      where: {
        name,
        teamId: user.teamId
      },
      include,
      rejectOnEmpty: true
    });
  }
  (0, _policies.authorize)(user, "read", emoji);
  ctx.body = {
    data: (0, _presenters.presentEmoji)(emoji),
    policies: (0, _presenters.presentPolicies)(user, [emoji])
  };
});
router.get("emojis.redirect", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.EmojisRedirectSchema), async ctx => {
  const {
    id,
    shareId
  } = ctx.input.query;
  const {
    user
  } = ctx.state.auth;
  const emoji = await _models.Emoji.unscoped().findByPk(id, {
    rejectOnEmpty: true,
    include: [{
      model: _models.Attachment
    }]
  });
  if (shareId) {
    const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx, {
      includeOAuthState: false
    });
    const {
      share
    } = await (0, _shareLoader.loadPublicShare)({
      id: shareId,
      teamId: teamFromCtx?.id
    });

    // Note: This is purposefully using a somewhat looser authorization check.
    // In order to load a custom emoji you must have a valid emoji ID and a
    // valid share ID from the same team.
    if (share.teamId !== emoji.teamId) {
      throw (0, _errors.AuthorizationError)();
    }
  } else {
    (0, _policies.authorize)(user, "read", emoji);
  }
  ctx.set("Cache-Control", `max-age=${_BaseStorage.default.defaultSignedUrlExpires}, immutable`);
  ctx.redirect(await emoji.attachment.signedUrl);
});
router.post("emojis.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.EmojisListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    query
  } = ctx.input.body;
  let where = {
    teamId: user.teamId
  };
  if (query) {
    where = {
      ...where,
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  const [emojis, total] = await Promise.all([_models.Emoji.findAll({
    where,
    include: [{
      model: _models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: _models.Attachment,
      as: "attachment",
      paranoid: false
    }],
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Emoji.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: emojis.map(_presenters.presentEmoji),
    policies: (0, _presenters.presentPolicies)(user, emojis)
  };
});
router.post("emojis.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.EmojisCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    attachmentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const attachment = await _models.Attachment.findByPk(attachmentId, {
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", attachment);
  const emoji = await _models.Emoji.createWithCtx(ctx, {
    name,
    attachmentId,
    teamId: user.teamId,
    createdById: user.id,
    createdBy: user
  });
  emoji.createdBy = user;
  emoji.attachment = attachment;
  ctx.body = {
    data: (0, _presenters.presentEmoji)(emoji),
    policies: (0, _presenters.presentPolicies)(user, [emoji])
  };
});
router.post("emojis.update", (0, _authentication.default)(), (0, _validate.default)(T.EmojisUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    attachmentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const emoji = await _models.Emoji.findByPk(id, {
    transaction,
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", emoji);
  const attachment = await _models.Attachment.findByPk(attachmentId, {
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", attachment);

  // Capture old attachment before reassigning so we can clean it up.
  const oldAttachmentId = emoji.attachmentId;
  emoji.attachmentId = attachmentId;
  emoji.createdById = user.id;
  await emoji.save({
    transaction
  });
  if (oldAttachmentId !== attachmentId) {
    const oldAttachment = await _models.Attachment.findByPk(oldAttachmentId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (oldAttachment) {
      await oldAttachment.destroy({
        transaction
      });
    }
  }
  emoji.attachment = attachment;
  emoji.createdBy = user;
  ctx.body = {
    data: (0, _presenters.presentEmoji)(emoji),
    policies: (0, _presenters.presentPolicies)(user, [emoji])
  };
});
router.post("emojis.delete", (0, _authentication.default)(), (0, _validate.default)(T.EmojisDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const emoji = await _models.Emoji.findByPk(id, {
    transaction: ctx.state.transaction,
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", emoji);
  await emoji.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;