"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _koaRouter = _interopRequireDefault(require("koa-router"));
var T = _interopRequireWildcard(require("./schema"));
var _policies = require("../../../../server/policies");
var _transaction = require("../../../../server/middlewares/transaction");
var _pagination = _interopRequireDefault(require("../../../../server/routes/api/middlewares/pagination"));
var _userPasskey = _interopRequireDefault(require("../presenters/userPasskey"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("passkeys.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.PasskeysListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    pagination
  } = ctx.state;
  const passkeys = await _models.UserPasskey.findAll({
    where: {
      userId: user.id
    },
    order: [["createdAt", "DESC"]],
    offset: pagination.offset,
    limit: pagination.limit
  });
  ctx.body = {
    pagination,
    data: passkeys.map(_userPasskey.default)
  };
});
router.post("passkeys.update", (0, _authentication.default)(), (0, _validate.default)(T.PasskeysUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    name
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const passkey = await _models.UserPasskey.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", passkey);
  await passkey.updateWithCtx(ctx, {
    name
  });
  ctx.body = {
    data: (0, _userPasskey.default)(passkey)
  };
});
router.post("passkeys.delete", (0, _authentication.default)(), (0, _validate.default)(T.PasskeysDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const passkey = await _models.UserPasskey.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", passkey);
  await passkey.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;