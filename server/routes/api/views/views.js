"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _errors = require("../../../errors");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var T = _interopRequireWildcard(require("./schema"));
var _transaction = require("../../../middlewares/transaction");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("views.list", (0, _authentication.default)(), (0, _validate.default)(T.ViewsListSchema), async ctx => {
  const {
    documentId,
    includeSuspended
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "listViews", document);
  if (!document.insightsEnabled) {
    throw (0, _errors.ValidationError)("Insights are not enabled for this document");
  }
  const views = await _models.View.findByDocument(documentId, {
    includeSuspended
  });
  ctx.body = {
    data: views.map(_presenters.presentView)
  };
});
router.post("views.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneThousandPerHour), (0, _authentication.default)(), (0, _validate.default)(T.ViewsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);
  const view = await _models.View.incrementOrCreate(ctx, {
    documentId,
    userId: user.id
  });
  view.user = user;
  ctx.body = {
    data: (0, _presenters.presentView)(view)
  };
});
var _default = exports.default = router;