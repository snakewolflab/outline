"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _types = require("../../../../shared/types");
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _transaction = require("../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _policies = require("../../../../server/policies");
var _pagination = _interopRequireWildcard(require("../../../../server/routes/api/middlewares/pagination"));
var _types2 = require("../../../../server/types");
var _webhookSubscription = _interopRequireDefault(require("../presenters/webhookSubscription"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("webhookSubscriptions.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _pagination.default)(), (0, _validate.default)(T.WebhookSubscriptionsListSchema), async ctx => {
  const {
    sort,
    direction,
    query
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listWebhookSubscription", user.team);
  let where = {
    teamId: user.teamId
  };
  if (query) {
    where = {
      ...where,
      [_sequelize.Op.and]: [_sequelize.Sequelize.literal(`unaccent(LOWER("webhook_subscription"."name")) like unaccent(LOWER(:query))`)]
    };
  }
  const replacements = {
    query: `%${query}%`
  };
  const {
    results,
    pagination
  } = await (0, _pagination.paginateQuery)(ctx, opts => _models.WebhookSubscription.findAll({
    where,
    replacements,
    include: [{
      association: "createdBy",
      required: false
    }],
    order: [[sort, direction]],
    offset: opts.offset,
    limit: opts.limit
  }), () => _models.WebhookSubscription.count({
    where,
    // @ts-expect-error Types are incorrect for count
    replacements
  }));
  ctx.body = {
    pagination,
    data: results.map(_webhookSubscription.default)
  };
});
router.post("webhookSubscriptions.create", (0, _authentication.default)({
  role: _types.UserRole.Admin,
  type: [_types2.AuthenticationType.API, _types2.AuthenticationType.APP]
}), (0, _validate.default)(T.WebhookSubscriptionsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    url,
    secret,
    events
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createWebhookSubscription", user.team);
  const webhookSubscription = await _models.WebhookSubscription.createWithCtx(ctx, {
    name,
    url,
    events: (0, _compat.compact)(events),
    enabled: true,
    secret: (0, _compat.isEmpty)(secret) ? undefined : secret,
    createdById: user.id,
    teamId: user.teamId
  });
  ctx.body = {
    data: (0, _webhookSubscription.default)(webhookSubscription)
  };
});
router.post("webhookSubscriptions.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin,
  type: [_types2.AuthenticationType.API, _types2.AuthenticationType.APP]
}), (0, _validate.default)(T.WebhookSubscriptionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const webhookSubscription = await _models.WebhookSubscription.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "delete", webhookSubscription);
  await webhookSubscription.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("webhookSubscriptions.update", (0, _authentication.default)({
  role: _types.UserRole.Admin,
  type: [_types2.AuthenticationType.API, _types2.AuthenticationType.APP]
}), (0, _validate.default)(T.WebhookSubscriptionsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    name,
    url,
    secret,
    events
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const webhookSubscription = await _models.WebhookSubscription.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "update", webhookSubscription);
  await webhookSubscription.updateWithCtx(ctx, {
    name,
    url,
    events: (0, _compat.compact)(events),
    enabled: true,
    secret: (0, _compat.isEmpty)(secret) ? undefined : secret
  });
  ctx.body = {
    data: (0, _webhookSubscription.default)(webhookSubscription)
  };
});
var _default = exports.default = router;