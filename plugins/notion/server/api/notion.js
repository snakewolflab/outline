"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("../../../../shared/types");
var _errors = require("../../../../server/errors");
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _transaction = require("../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _oauth = require("../../../../server/utils/oauth");
var _notion = require("../notion");
var T = _interopRequireWildcard(require("./schema"));
var _NotionUtils = require("../../shared/NotionUtils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.get("notion.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.NotionCallbackSchema), (0, _apexAuthRedirect.default)({
  getTeamId: ctx => _NotionUtils.NotionUtils.parseState(ctx.input.query.state)?.teamId,
  getRedirectPath: (ctx, team) => _NotionUtils.NotionUtils.callbackUrl({
    baseUrl: team.url,
    params: ctx.request.querystring
  }),
  getErrorPath: () => _NotionUtils.NotionUtils.errorUrl("unauthenticated")
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
    ctx.redirect(_NotionUtils.NotionUtils.errorUrl(error));
    return;
  }
  const parsedState = _NotionUtils.NotionUtils.parseState(state);
  if (!parsedState) {
    throw (0, _errors.ValidationError)("Invalid state");
  }
  (0, _oauth.verifyOAuthStateNonce)(ctx, _NotionUtils.NotionOAuthNonceCookie, parsedState.nonce);

  // validation middleware ensures that code is non-null at this point.
  const data = await _notion.NotionClient.oauthAccess(code);
  const authentication = await _models.IntegrationAuthentication.create({
    service: _types.IntegrationService.Notion,
    userId: user.id,
    teamId: user.teamId,
    token: data.access_token
  }, {
    transaction
  });
  const integration = await _models.Integration.create({
    service: _types.IntegrationService.Notion,
    type: _types.IntegrationType.Import,
    userId: user.id,
    teamId: user.teamId,
    authenticationId: authentication.id,
    settings: {
      externalWorkspace: {
        id: data.workspace_id,
        name: data.workspace_name ?? "Notion import",
        iconUrl: data.workspace_icon ?? undefined
      }
    }
  }, {
    transaction
  });
  ctx.redirect(_NotionUtils.NotionUtils.successUrl(integration.id));
});
var _default = exports.default = router;