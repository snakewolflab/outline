"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("../../../../shared/types");
var _env = _interopRequireDefault(require("../../../env"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _AuthenticationHelper = _interopRequireDefault(require("../../../models/helpers/AuthenticationHelper"));
var _policies = require("../../../policies");
var _PluginManager = require("../../../utils/PluginManager");
var _presenters = require("../../../presenters");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("authenticationProviders.info", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.AuthenticationProvidersInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id);
  (0, _policies.authorize)(user, "read", authenticationProvider);
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.update", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.AuthenticationProvidersUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    isEnabled,
    settings
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", authenticationProvider);
  if (isEnabled !== undefined) {
    const enabled = !!isEnabled;
    if (enabled) {
      await authenticationProvider.enable(ctx);
    } else {
      await authenticationProvider.disable(ctx);
    }
  }
  if (settings !== undefined) {
    await authenticationProvider.updateWithCtx(ctx, {
      settings: {
        ...(authenticationProvider.settings ?? {}),
        ...settings
      }
    });
  }
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.AuthenticationProvidersDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", authenticationProvider);
  if (authenticationProvider.enabled) {
    await authenticationProvider.disable(ctx);
  }

  // On self-hosted, providers are typically registered via env vars and
  // would re-appear on the login screen if the row was destroyed, so we
  // keep the row with enabled=false. On cloud, destroy the row so the
  // admin can reconnect with a different workspace.
  if (_env.default.isCloudHosted) {
    await authenticationProvider.destroy({
      transaction
    });
  }
  ctx.body = {
    success: true
  };
});
router.post("authenticationProviders.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), async ctx => {
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "read", user.team);
  const teamAuthenticationProviders = await user.team.$get("authenticationProviders");
  const data = _AuthenticationHelper.default.providers.filter(p => p.value.id !== "email" && p.value.id !== "passkeys").map(p => {
    const row = teamAuthenticationProviders.find(t => t.name === p.value.id);
    const groupSyncProvider = _PluginManager.PluginManager.getGroupSyncProvider(p.value.id);
    return {
      id: p.value.id,
      name: p.value.id,
      displayName: p.name,
      isEnabled: false,
      isConnected: false,
      groupSyncSupported: !!groupSyncProvider,
      groupSyncUsesClaim: groupSyncProvider?.useGroupClaim ?? false,
      ...(row ? (0, _presenters.presentAuthenticationProvider)(row) : {})
    };
  }).sort((a, b) => a.isEnabled === b.isEnabled ? 0 : a.isEnabled ? -1 : 1);
  ctx.body = {
    data
  };
});
var _default = exports.default = router;