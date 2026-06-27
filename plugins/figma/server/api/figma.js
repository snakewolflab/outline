"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _error = require("../../../../shared/utils/error");
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var T = _interopRequireWildcard(require("./schema"));
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _FigmaUtils = require("../../shared/FigmaUtils");
var _transaction = require("../../../../server/middlewares/transaction");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _types = require("../../../../shared/types");
var _errors = require("../../../../server/errors");
var _models = require("../../../../server/models");
var _oauth = require("../../../../server/utils/oauth");
var _dateFns = require("date-fns");
var _figma = require("../figma");
var _UploadIntegrationLogoTask = _interopRequireDefault(require("../../../../server/queues/tasks/UploadIntegrationLogoTask"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.get("figma.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.FigmaCallbackSchema), (0, _apexAuthRedirect.default)({
  getTeamId: ctx => _FigmaUtils.FigmaUtils.parseState(ctx.input.query.state)?.teamId,
  getRedirectPath: (ctx, team) => _FigmaUtils.FigmaUtils.callbackUrl({
    baseUrl: team.url,
    params: ctx.request.querystring
  }),
  getErrorPath: () => _FigmaUtils.FigmaUtils.errorUrl("unauthenticated")
}), (0, _transaction.transaction)(), async ctx => {
  const {
    code,
    error,
    state
  } = ctx.input.query;

  // Check error after any sub-domain redirection. Otherwise, the user will be redirected to the root domain.
  if (error) {
    ctx.redirect(_FigmaUtils.FigmaUtils.errorUrl(error));
    return;
  }
  const parsedState = _FigmaUtils.FigmaUtils.parseState(state);
  if (!parsedState) {
    throw (0, _errors.ValidationError)("Invalid state");
  }
  (0, _oauth.verifyOAuthStateNonce)(ctx, _FigmaUtils.FigmaOAuthNonceCookie, parsedState.nonce);
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  try {
    // validation middleware ensures that code is non-null at this point.
    const oauth = await _figma.Figma.oauthAccess(code);
    const figmaAccount = await _figma.Figma.getInstalledAccount(oauth.access_token);
    const authentication = await _models.IntegrationAuthentication.create({
      service: _types.IntegrationService.Figma,
      userId: user.id,
      teamId: user.teamId,
      token: oauth.access_token,
      refreshToken: oauth.refresh_token,
      expiresAt: (0, _dateFns.addSeconds)(Date.now(), oauth.expires_in),
      scopes: _FigmaUtils.FigmaUtils.oauthScopes
    }, {
      transaction
    });
    const integration = await _models.Integration.create({
      service: _types.IntegrationService.Figma,
      type: _types.IntegrationType.LinkedAccount,
      userId: user.id,
      teamId: user.teamId,
      authenticationId: authentication.id,
      settings: {
        figma: {
          account: {
            id: figmaAccount.id,
            name: figmaAccount.handle,
            email: figmaAccount.email,
            avatarUrl: figmaAccount.img_url
          }
        }
      }
    }, {
      transaction
    });
    transaction.afterCommit(async () => {
      await new _UploadIntegrationLogoTask.default().schedule({
        integrationId: integration.id,
        logoUrl: figmaAccount.img_url
      });
    });
    ctx.redirect(_FigmaUtils.FigmaUtils.successUrl());
  } catch (err) {
    _Logger.default.error("Encountered error during Figma OAuth callback", (0, _error.toError)(err));
    ctx.redirect(_FigmaUtils.FigmaUtils.errorUrl("unknown"));
  }
});
var _default = exports.default = router;