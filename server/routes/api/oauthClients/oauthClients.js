"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("../../../../shared/types");
var _errors = require("../../../errors");
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
router.post("oauthClients.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _pagination.default)(), (0, _validate.default)(T.OAuthClientsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId,
    createdById: {
      [_sequelize.Op.ne]: null
    }
  };
  (0, _policies.authorize)(user, "listOAuthClients", user.team);
  const [oauthClients, total] = await Promise.all([_models.OAuthClient.findAll({
    where,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.OAuthClient.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: oauthClients.map(oauthClient => (0, _policies.can)(user, "update", oauthClient) ? (0, _presenters.presentOAuthClient)(oauthClient) : (0, _presenters.presentPublishedOAuthClient)(oauthClient)),
    policies: (0, _presenters.presentPolicies)(user, oauthClients)
  };
});
router.post("oauthClients.info", (0, _authentication.default)(), (0, _validate.default)(T.OAuthClientsInfoSchema), async ctx => {
  const {
    id,
    clientId,
    redirectUri
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const oauthClient = await _models.OAuthClient.findOne({
    where: clientId ? {
      clientId
    } : {
      id
    },
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", oauthClient);
  if (redirectUri && !oauthClient.redirectUris.includes(redirectUri)) {
    throw (0, _errors.ValidationError)("redirect_uri is invalid");
  }
  const isInternalApp = oauthClient.teamId === user.teamId;
  const canUpdate = (0, _policies.can)(user, "update", oauthClient);
  ctx.body = {
    data: canUpdate ? (0, _presenters.presentOAuthClient)(oauthClient) : (0, _presenters.presentPublishedOAuthClient)(oauthClient),
    policies: isInternalApp ? (0, _presenters.presentPolicies)(user, [oauthClient]) : []
  };
});
router.post("oauthClients.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.OAuthClientsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const input = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createOAuthClient", user.team);
  const oauthClient = await _models.OAuthClient.createWithCtx(ctx, {
    ...input,
    teamId: user.teamId,
    createdById: user.id
  });
  ctx.body = {
    data: (0, _presenters.presentOAuthClient)(oauthClient),
    policies: (0, _presenters.presentPolicies)(user, [oauthClient])
  };
});
router.post("oauthClients.update", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.OAuthClientsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    ...input
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const oauthClient = await _models.OAuthClient.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "update", oauthClient);
  await oauthClient.updateWithCtx(ctx, input);
  ctx.body = {
    data: (0, _presenters.presentOAuthClient)(oauthClient),
    policies: (0, _presenters.presentPolicies)(user, [oauthClient])
  };
});
router.post("oauthClients.rotate_secret", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.OAuthClientsRotateSecretSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const oauthClient = await _models.OAuthClient.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "update", oauthClient);
  oauthClient.rotateClientSecret();
  await oauthClient.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentOAuthClient)(oauthClient),
    policies: (0, _presenters.presentPolicies)(user, [oauthClient])
  };
});
router.post("oauthClients.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.OAuthClientsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const oauthClient = await _models.OAuthClient.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "delete", oauthClient);
  await oauthClient.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;