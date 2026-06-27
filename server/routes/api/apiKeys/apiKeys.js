"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("../../../../shared/types");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _types2 = require("../../../types");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const globalScopes = new Set(Object.values(_types.Scope));
router.post("apiKeys.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)({
  type: _types2.AuthenticationType.APP
}), (0, _validate.default)(T.APIKeysCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    scope,
    expiresAt
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createApiKey", user.team);
  const apiKey = await _models.ApiKey.createWithCtx(ctx, {
    name,
    userId: user.id,
    expiresAt,
    scope: scope?.map(s => s.startsWith("/api/") || s.includes(":") || globalScopes.has(s) ? s : `/api/${s.replace(/^\//, "")}`)
  });
  apiKey.user = user;
  ctx.body = {
    data: (0, _presenters.presentApiKey)(apiKey)
  };
});
router.post("apiKeys.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.APIKeysListSchema), async ctx => {
  const {
    userId,
    query,
    sort,
    direction
  } = ctx.input.body;
  const {
    pagination
  } = ctx.state;
  const actor = ctx.state.auth.user;
  let userWhere = {
    teamId: actor.teamId
  };
  if ((0, _policies.cannot)(actor, "listApiKeys", actor.team)) {
    userWhere = {
      ...userWhere,
      id: actor.id
    };
  }
  if (userId) {
    const user = await _models.User.findByPk(userId);
    (0, _policies.authorize)(actor, "listApiKeys", user);
    userWhere = {
      ...userWhere,
      id: userId
    };
  }
  let where = {};
  if (query) {
    where = {
      ...where,
      [_sequelize.Op.and]: [_sequelize.Sequelize.literal(`unaccent(LOWER("apiKey"."name")) like unaccent(LOWER(:query))`)]
    };
  }
  const replacements = {
    query: `%${query}%`
  };
  const apiKeys = await _models.ApiKey.findAll({
    where,
    replacements,
    include: [{
      model: _models.User,
      required: true,
      where: userWhere
    }],
    order: [[sort, direction]],
    offset: pagination.offset,
    limit: pagination.limit
  });
  ctx.body = {
    pagination,
    data: apiKeys.map(_presenters.presentApiKey)
  };
});
router.post("apiKeys.delete", (0, _authentication.default)({
  type: _types2.AuthenticationType.APP
}), (0, _validate.default)(T.APIKeysDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const key = await _models.ApiKey.scope("withUser").findByPk(id, {
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.ApiKey
    },
    transaction
  });
  (0, _policies.authorize)(user, "delete", key);
  await key.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;