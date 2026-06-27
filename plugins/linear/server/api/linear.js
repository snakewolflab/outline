"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _errors = require("../../../../server/errors");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _transaction = require("../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _oauth = require("../../../../server/utils/oauth");
var _linear = require("../linear");
var _UploadIntegrationLogoTask = _interopRequireDefault(require("../../../../server/queues/tasks/UploadIntegrationLogoTask"));
var T = _interopRequireWildcard(require("./schema"));
var _LinearUtils = require("../../shared/LinearUtils");
var _dateFns = require("date-fns");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.get("linear.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.LinearCallbackSchema), (0, _apexAuthRedirect.default)({
  getTeamId: ctx => _LinearUtils.LinearUtils.parseState(ctx.input.query.state)?.teamId,
  getRedirectPath: (ctx, team) => _LinearUtils.LinearUtils.callbackUrl({
    baseUrl: team.url,
    params: ctx.request.querystring
  }),
  getErrorPath: () => _LinearUtils.LinearUtils.errorUrl("unauthenticated")
}), (0, _transaction.transaction)(), async ctx => {
  const {
    code,
    error,
    state
  } = ctx.input.query;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;

  // Check error after any sub-domain redirection. Otherwise, the user will be redirected to the root domain.
  if (error) {
    ctx.redirect(_LinearUtils.LinearUtils.errorUrl(error));
    return;
  }
  const parsedState = _LinearUtils.LinearUtils.parseState(state);
  if (!parsedState) {
    throw (0, _errors.ValidationError)("Invalid state");
  }
  (0, _oauth.verifyOAuthStateNonce)(ctx, _LinearUtils.LinearOAuthNonceCookie, parsedState.nonce);
  try {
    // validation middleware ensures that code is non-null at this point.
    const oauth = await _linear.Linear.oauthAccess(code);
    const workspace = await _linear.Linear.getInstalledWorkspace(oauth.access_token);
    const authentication = await _models.IntegrationAuthentication.create({
      service: _types.IntegrationService.Linear,
      userId: user.id,
      teamId: user.teamId,
      token: oauth.access_token,
      refreshToken: oauth.refresh_token,
      expiresAt: oauth.expires_in ? (0, _dateFns.addSeconds)(Date.now(), oauth.expires_in) : undefined,
      scopes: oauth.scope.split(" ")
    }, {
      transaction
    });
    const integration = await _models.Integration.create({
      service: _types.IntegrationService.Linear,
      type: _types.IntegrationType.Embed,
      userId: user.id,
      teamId: user.teamId,
      authenticationId: authentication.id,
      settings: {
        linear: {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            key: workspace.urlKey,
            logoUrl: workspace.logoUrl
          }
        }
      }
    }, {
      transaction
    });
    transaction.afterCommit(async () => {
      if (workspace.logoUrl) {
        await new _UploadIntegrationLogoTask.default().schedule({
          integrationId: integration.id,
          logoUrl: workspace.logoUrl
        });
      }
    });
    ctx.redirect(_LinearUtils.LinearUtils.successUrl());
  } catch (err) {
    _Logger.default.error("Encountered error during Linear OAuth callback", (0, _error.toError)(err));
    ctx.redirect(_LinearUtils.LinearUtils.errorUrl("unknown"));
  }
});
var _default = exports.default = router;