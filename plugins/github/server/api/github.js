"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _types = require("../../../../shared/types");
var _context = require("../../../../server/context");
var _errors = require("../../../../server/errors");
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _transaction = require("../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _validateWebhook = _interopRequireDefault(require("../../../../server/middlewares/validateWebhook"));
var _models = require("../../../../server/models");
var _oauth = require("../../../../server/utils/oauth");
var _GitHubUtils = require("../../shared/GitHubUtils");
var _env = _interopRequireDefault(require("../env"));
var _github = require("../github");
var _GitHubWebhookTask = _interopRequireDefault(require("../tasks/GitHubWebhookTask"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.get("github.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.GitHubCallbackSchema), (0, _apexAuthRedirect.default)({
  getTeamId: ctx => _GitHubUtils.GitHubUtils.parseState(ctx.input.query.state)?.teamId,
  getRedirectPath: (ctx, team) => _GitHubUtils.GitHubUtils.callbackUrl({
    baseUrl: team.url,
    params: ctx.request.querystring
  }),
  getErrorPath: () => _GitHubUtils.GitHubUtils.errorUrl("unauthenticated")
}), (0, _transaction.transaction)(), async ctx => {
  const {
    code,
    state,
    error,
    installation_id: installationId,
    setup_action: setupAction
  } = ctx.input.query;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  if (error) {
    ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl(error));
    return;
  }
  if (setupAction === T.SetupAction.request) {
    ctx.redirect(_GitHubUtils.GitHubUtils.installRequestUrl());
    return;
  }
  const parsedState = _GitHubUtils.GitHubUtils.parseState(state);
  if (!parsedState) {
    throw (0, _errors.ValidationError)("Invalid state");
  }
  (0, _oauth.verifyOAuthStateNonce)(ctx, _GitHubUtils.GitHubOAuthNonceCookie, parsedState.nonce);
  const client = await _github.GitHub.authenticateAsUser(code, state);
  const installationsByUser = await client.requestAppInstallations();
  const installation = (0, _compat.find)(installationsByUser, i => i.id === installationId);
  if (!installation) {
    return ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl("unauthenticated"));
  }
  const scopes = Object.entries(installation.permissions).map(_ref => {
    let [name, permission] = _ref;
    return `${name}:${String(permission)}`;
  });
  const authentication = await _models.IntegrationAuthentication.create({
    service: _types.IntegrationService.GitHub,
    userId: user.id,
    teamId: user.teamId,
    scopes
  }, {
    transaction
  });
  await _models.Integration.createWithCtx((0, _context.createContext)({
    user,
    transaction
  }), {
    service: _types.IntegrationService.GitHub,
    type: _types.IntegrationType.Embed,
    userId: user.id,
    teamId: user.teamId,
    authenticationId: authentication.id,
    settings: {
      github: {
        installation: {
          id: installationId,
          account: {
            id: installation.account?.id,
            name: installation.account?.login,
            avatarUrl: installation.account?.avatar_url
          }
        }
      }
    }
  });
  ctx.redirect(_GitHubUtils.GitHubUtils.url);
});
router.post("github.webhooks", (0, _validateWebhook.default)({
  secretKey: _env.default.GITHUB_WEBHOOK_SECRET,
  getSignatureFromHeader: ctx => {
    const {
      headers
    } = ctx.request;
    const signatureHeader = headers["x-hub-signature-256"];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    return signature?.split("=")[1];
  }
}), async ctx => {
  const {
    headers,
    body
  } = ctx.request;
  await new _GitHubWebhookTask.default().schedule({
    payload: body,
    headers
  });
  ctx.status = 202;
});
var _default = exports.default = router;