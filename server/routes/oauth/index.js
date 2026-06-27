"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _oauth2Server = _interopRequireDefault(require("@node-oauth/oauth2-server"));
var _koa = _interopRequireDefault(require("koa"));
var _koaBody = _interopRequireDefault(require("koa-body"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _env = _interopRequireDefault(require("../../env"));
var _errors = require("../../errors");
var _apiContext = require("../../middlewares/apiContext");
var _authentication = _interopRequireDefault(require("../../middlewares/authentication"));
var _rateLimiter = require("../../middlewares/rateLimiter");
var _requestTracer = _interopRequireDefault(require("../../middlewares/requestTracer"));
var _transaction = require("../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../middlewares/validate"));
var _models = require("../../models");
var _OAuthAuthentication = _interopRequireDefault(require("../../models/oauth/OAuthAuthentication"));
var _policies = require("../../policies");
var _oauthClient = require("../../presenters/oauthClient");
var _RateLimiter = require("../../utils/RateLimiter");
var _types = require("../../../shared/types");
var _OAuthInterface = require("../../utils/oauth/OAuthInterface");
var _passport = require("../../utils/passport");
var _oauthErrorHandler = _interopRequireDefault(require("./middlewares/oauthErrorHandler"));
var _registrationAuth = _interopRequireDefault(require("./middlewares/registrationAuth"));
var T = _interopRequireWildcard(require("./schema"));
var _csrf = require("../../middlewares/csrf");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = new _koa.default();
const router = new _koaRouter.default();
const oauth = new _oauth2Server.default({
  model: _OAuthInterface.OAuthInterface,
  requireClientAuthentication: {
    // Allow public clients (those without a client secret) to refresh without a client secret.
    refresh_token: false
  },
  // Always revoke the used refresh token and issue a new one, see:
  // https://www.rfc-editor.org/rfc/rfc6819#section-5.2.2.3
  alwaysIssueNewRefreshToken: true
});
router.post("/authorize", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const clientId = ctx.request.body.client_id;
  if (!clientId) {
    throw (0, _errors.ValidationError)("Missing client_id");
  }
  const client = await _models.OAuthClient.findByClientId(clientId);
  (0, _policies.authorize)(user, "read", client);

  // Note: These objects are mutated by the OAuth2Server library
  const request = new _oauth2Server.default.Request({
    headers: ctx.request.headers,
    method: ctx.request.method,
    query: ctx.request.query,
    body: ctx.request.body
  });
  const response = new _oauth2Server.default.Response();
  const authorizationCode = await oauth.authorize(request, response, {
    // Require state to prevent CSRF attacks
    allowEmptyState: false,
    authorizationCodeLifetime: _models.OAuthAuthorizationCode.authorizationCodeLifetime,
    authenticateHandler: {
      // Fetch the current user from the request, so the library knows
      // which user is authorizing the client.
      handle: async () => user
    }
  });

  // In the case of a redirect, the response will be always be a redirect
  // to the redirect_uri with the authorization code as a query parameter.
  if (response.status === 302 && response.headers?.location) {
    const location = response.headers.location;
    delete response.headers.location;
    ctx.set(response.headers);
    ctx.redirect(location);
    return;
  }
  ctx.body = {
    code: authorizationCode
  };
});
router.post("/token", (0, _validate.default)(T.TokenSchema), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), async ctx => {
  const grantType = ctx.input.body.grant_type;
  const refreshToken = ctx.input.body.refresh_token;
  const clientId = ctx.input.body.client_id;
  const clientSecret = ctx.input.body.client_secret;

  // Because we disabled client authentication for refresh_token grant type at the library
  // initialization, we need to manually enforce it here for confidential clients.
  if (grantType === "refresh_token" && !clientSecret) {
    if (!refreshToken) {
      throw (0, _errors.ValidationError)("Missing refresh_token for refresh_token grant type");
    }
    if (!clientId) {
      throw (0, _errors.ValidationError)("Missing client_id for refresh_token grant type");
    }
    const client = await _models.OAuthClient.findByClientId(clientId);
    if (!client) {
      throw (0, _errors.ValidationError)("Invalid client_id");
    }
    if (client.clientType === "confidential") {
      throw (0, _errors.ValidationError)("Missing client_secret for confidential client");
    }
  }

  // Note: These objects are mutated by the OAuth2Server library
  const request = new _oauth2Server.default.Request({
    headers: ctx.request.headers,
    method: ctx.request.method,
    query: ctx.request.query,
    body: ctx.request.body
  });
  const response = new _oauth2Server.default.Response();
  const token = await oauth.token(request, response, {
    accessTokenLifetime: _OAuthAuthentication.default.accessTokenLifetime,
    refreshTokenLifetime: _OAuthAuthentication.default.refreshTokenLifetime
  });
  if (response.headers) {
    ctx.set(response.headers);
  }
  ctx.body = {
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    // OAuth2 spec says that the expires_in should be in seconds.
    expires_in: token.accessTokenExpiresAt ? Math.round((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000) : undefined,
    token_type: "Bearer",
    // OAuth2 spec says that the scope should be a space-separated list.
    scope: token.scope?.join(" ")
  };
});
router.post("/revoke", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _validate.default)(T.TokenRevokeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    token
  } = ctx.input.body;
  if (_OAuthAuthentication.default.match(token)) {
    const accessToken = await _OAuthAuthentication.default.findByAccessToken(token);
    await accessToken?.destroyWithCtx(ctx);
  }
  if (_OAuthAuthentication.default.matchRefreshToken(token)) {
    const refreshToken = await _OAuthAuthentication.default.findByRefreshToken(token);
    await refreshToken?.destroyWithCtx(ctx);
  }

  // https://datatracker.ietf.org/doc/html/rfc7009#section-2.2
  // Note: invalid tokens do not cause an error response since the client
  // cannot handle such an error in a reasonable way
  ctx.body = {
    success: true
  };
});
router.post("/register", (0, _validate.default)(T.RegisterSchema), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), async ctx => {
  if (_env.default.OAUTH_DISABLE_DCR) {
    throw (0, _errors.NotFoundError)();
  }
  const {
    client_name,
    redirect_uris,
    token_endpoint_auth_method,
    client_uri,
    logo_uri,
    contacts
  } = ctx.input.body;
  const team = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });
  if (!team) {
    throw (0, _errors.NotFoundError)();
  }
  if (!team.getPreference(_types.TeamPreference.MCP)) {
    throw (0, _errors.NotFoundError)();
  }
  const clientType = token_endpoint_auth_method === "client_secret_post" ? "confidential" : "public";
  const client = await _models.OAuthClient.createWithCtx(ctx, {
    // RFC 7591 makes client_name optional; fall back to a generic label so
    // dynamic-registration clients that omit it still register cleanly.
    name: client_name ?? "Untitled application",
    redirectUris: redirect_uris,
    clientType,
    developerUrl: client_uri ?? null,
    avatarUrl: logo_uri ?? null,
    published: false,
    teamId: team.id,
    createdById: null
  });
  _Logger.default.info("authentication", "OAuth client registered", {
    clientId: client.clientId,
    redirectUris: client.redirectUris,
    teamId: team.id,
    contacts
  });
  ctx.status = 201;
  ctx.body = (0, _oauthClient.presentDCRClient)(team.url, client, {
    includeRegistrationAccessToken: true,
    includeCredentials: true
  });
});
router.get("/register/:clientId", (0, _registrationAuth.default)(), async ctx => {
  const client = ctx.state.oauthClient;
  const team = await _models.Team.findByPk(client.teamId, {
    rejectOnEmpty: true
  });
  ctx.body = (0, _oauthClient.presentDCRClient)(team.url, client, {
    includeRegistrationAccessToken: false
  });
});
router.put("/register/:clientId", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _validate.default)(T.RegisterUpdateSchema), (0, _transaction.transaction)(), (0, _registrationAuth.default)(), async ctx => {
  const client = ctx.state.oauthClient;
  const {
    client_name,
    redirect_uris,
    client_uri,
    logo_uri
  } = ctx.input.body;
  const team = await _models.Team.findByPk(client.teamId, {
    rejectOnEmpty: true,
    transaction: ctx.state.transaction
  });
  client.name = client_name;
  client.redirectUris = redirect_uris;
  client.developerUrl = client_uri ?? null;
  client.avatarUrl = logo_uri ?? null;

  // Rotate registration access token per RFC 7592 recommendation
  client.rotateRegistrationAccessToken();
  await client.saveWithCtx(ctx);
  ctx.body = (0, _oauthClient.presentDCRClient)(team.url, client, {
    includeRegistrationAccessToken: true,
    includeCredentials: false
  });
});
router.delete("/register/:clientId", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _transaction.transaction)(), (0, _registrationAuth.default)(), async ctx => {
  const client = ctx.state.oauthClient;
  await client.destroyWithCtx(ctx);
  ctx.status = 204;
  ctx.body = "";
});
app.use((0, _requestTracer.default)());
app.use((0, _oauthErrorHandler.default)());
app.use((0, _koaBody.default)());
app.use((0, _apiContext.apiContext)());
app.use((0, _csrf.verifyCSRFToken)());
app.use(router.routes());
var _default = exports.default = app;