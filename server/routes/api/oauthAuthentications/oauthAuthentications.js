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
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _oauthAuthentication = _interopRequireDefault(require("../../../presenters/oauthAuthentication"));
var _database = require("../../../storage/database");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("oauthAuthentications.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.OAuthAuthenticationsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const oauthAuthentications = await _database.sequelize.query(`
      SELECT DISTINCT ON (oa."oauthClientId", oa."scope")
        oa.*,
        oc.id AS "oauthClient.id",
        oc.name AS "oauthClient.name",
        oc."avatarUrl" AS "oauthClient.avatarUrl",
        oc."clientId" AS "oauthClient.clientId"
      FROM oauth_authentications oa
      INNER JOIN oauth_clients oc ON oc.id = oa."oauthClientId"
      WHERE oa."userId" = :userId
      AND oa."deletedAt" IS NULL
      ORDER BY oa."oauthClientId", oa."scope", oa."lastActiveAt", oa."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `, {
    replacements: {
      userId: user.id,
      limit: ctx.state.pagination.limit,
      offset: ctx.state.pagination.offset
    },
    type: _sequelize.QueryTypes.SELECT,
    nest: true
  });
  ctx.body = {
    pagination: {
      ...ctx.state.pagination
    },
    data: oauthAuthentications.map(_oauthAuthentication.default),
    policies: (0, _presenters.presentPolicies)(user, oauthAuthentications)
  };
});
router.post("oauthAuthentications.delete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.OAuthAuthenticationsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    oauthClientId,
    scope
  } = ctx.input.body;
  const oauthAuthentications = await _models.OAuthAuthentication.findAll({
    where: {
      userId: user.id,
      oauthClientId,
      ...(scope ? {
        scope
      } : {})
    },
    transaction: ctx.state.transaction
  });
  for (const oauthAuthentication of oauthAuthentications) {
    (0, _policies.authorize)(user, "delete", oauthAuthentication);
    await oauthAuthentication.destroyWithCtx(ctx);
  }
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;