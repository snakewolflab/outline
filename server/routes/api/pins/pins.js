"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _pinCreator = _interopRequireDefault(require("../../../commands/pinCreator"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("pins.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.PinsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    documentId,
    collectionId,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "read", document);
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", collection);
    (0, _policies.authorize)(user, "pin", document);
  } else {
    (0, _policies.authorize)(user, "pinToHome", document);
  }
  const pin = await (0, _pinCreator.default)({
    ctx,
    user,
    documentId,
    collectionId,
    index
  });
  ctx.body = {
    data: (0, _presenters.presentPin)(pin),
    policies: (0, _presenters.presentPolicies)(user, [pin])
  };
});
router.post("pins.info", (0, _authentication.default)(), (0, _validate.default)(T.PinsInfoSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    documentId,
    collectionId
  } = ctx.input.body;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);

  // There can be only one pin with these props.
  const pin = await _models.Pin.findOne({
    where: {
      documentId,
      collectionId: collectionId ?? null,
      createdById: user.id,
      teamId: user.teamId
    }
  });
  if (!pin) {
    ctx.response.status = 204;
    return;
  }
  ctx.body = {
    data: (0, _presenters.presentPin)(pin),
    policies: (0, _presenters.presentPolicies)(user, [pin])
  };
});
router.post("pins.list", (0, _authentication.default)(), (0, _validate.default)(T.PinsListSchema), (0, _pagination.default)(), async ctx => {
  const {
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", collection);
  }
  const [pins, collectionIds] = await Promise.all([_models.Pin.findAll({
    where: {
      ...(collectionId ? {
        collectionId
      } : {
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }),
      teamId: user.teamId
    },
    order: [_sequelize.Sequelize.literal('"pin"."index" collate "C"'), ["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), user.collectionIds()]);
  const documents = await _models.Document.withMembershipScope(user.id).findAll({
    where: {
      id: pins.map(pin => pin.documentId),
      collectionId: collectionIds
    }
  });
  const policies = (0, _presenters.presentPolicies)(user, [...documents, ...pins]);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      pins: pins.map(_presenters.presentPin),
      documents: await (0, _presenters.presentDocuments)(ctx, documents)
    },
    policies
  };
});
router.post("pins.update", (0, _authentication.default)(), (0, _validate.default)(T.PinsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const pin = await _models.Pin.findByPk(id, {
    transaction,
    lock: _sequelize.Transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(pin.documentId, {
    userId: user.id,
    transaction
  });
  if (pin.collectionId) {
    (0, _policies.authorize)(user, "pin", document);
  } else {
    (0, _policies.authorize)(user, "update", pin);
  }
  await pin.updateWithCtx(ctx, {
    index
  });
  ctx.body = {
    data: (0, _presenters.presentPin)(pin),
    policies: (0, _presenters.presentPolicies)(user, [pin])
  };
});
router.post("pins.delete", (0, _authentication.default)(), (0, _validate.default)(T.PinsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const pin = await _models.Pin.findByPk(id, {
    transaction,
    lock: _sequelize.Transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(pin.documentId, {
    userId: user.id,
    transaction
  });
  if (pin.collectionId) {
    (0, _policies.authorize)(user, "unpin", document);
  } else {
    (0, _policies.authorize)(user, "delete", pin);
  }
  await pin.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;