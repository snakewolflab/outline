"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _passportSlackOauth = require("passport-slack-oauth2");
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _accountProvisioner = _interopRequireDefault(require("../../../../server/commands/accountProvisioner"));
var _errors = require("../../../../server/errors");
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _passport = _interopRequireDefault(require("../../../../server/middlewares/passport"));
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _policies = require("../../../../server/policies");
var _database = require("../../../../server/storage/database");
var _oauth = require("../../../../server/utils/oauth");
var _passport2 = require("../../../../server/utils/passport");
var _email = require("../../../../shared/utils/email");
var _env = _interopRequireDefault(require("../env"));
var Slack = _interopRequireWildcard(require("../slack"));
var T = _interopRequireWildcard(require("./schema"));
var _SlackUtils = require("../../shared/SlackUtils");
var _context = require("../../../../server/context");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const providerName = "slack";
const scopes = ["identity.email", "identity.basic", "identity.avatar", "identity.team"];
if (_env.default.SLACK_CLIENT_ID && _env.default.SLACK_CLIENT_SECRET) {
  const strategy = new _passportSlackOauth.Strategy({
    clientID: _env.default.SLACK_CLIENT_ID,
    clientSecret: _env.default.SLACK_CLIENT_SECRET,
    callbackURL: _SlackUtils.SlackUtils.callbackUrl(),
    passReqToCallback: true,
    // @ts-expect-error StateStore
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (context, accessToken, refreshToken, params, profile, done) {
    try {
      const team = await (0, _passport2.getTeamFromContext)(context);
      const client = (0, _passport2.getClientFromOAuthState)(context);
      const user = context.state?.auth?.user ?? (await (0, _passport2.getUserFromOAuthState)(context));
      const {
        domain
      } = (0, _email.parseEmail)(profile.user.email);
      const ctx = (0, _context.createContext)({
        ip: context.ip,
        user,
        authType: context.state?.auth?.type
      });
      const result = await (0, _accountProvisioner.default)(ctx, {
        team: {
          teamId: team?.id,
          name: profile.team.name,
          domain,
          subdomain: profile.team.domain,
          avatarUrl: profile.team.image_230
        },
        user: {
          name: profile.user.name,
          email: profile.user.email,
          // Slack only returns confirmed workspace email addresses.
          emailVerified: true,
          avatarUrl: profile.user.image_192
        },
        authenticationProvider: {
          name: providerName,
          providerId: profile.team.id
        },
        authentication: {
          providerId: profile.user.id,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes
        }
      });
      return done(null, result.user, {
        ...result,
        client
      });
    } catch (err) {
      return done((0, _error.toError)(err), null);
    }
  });
  // For some reason the author made the strategy name capatilised, I don't know
  // why but we need everything lowercase so we just monkey-patch it here.
  strategy.name = providerName;
  _koaPassport.default.use(strategy);
  router.get("slack", _passport2.startOAuthFlow, _koaPassport.default.authenticate(providerName));
  router.get("slack.callback", (0, _passport.default)(providerName));
  router.get("slack.post", (0, _authentication.default)({
    optional: true
  }), (0, _validate.default)(T.SlackPostSchema), (0, _apexAuthRedirect.default)({
    getTeamId: ctx => _SlackUtils.SlackUtils.parseState(ctx.input.query.state)?.teamId,
    getRedirectPath: (ctx, team) => _SlackUtils.SlackUtils.connectUrl({
      baseUrl: team.url,
      params: ctx.request.querystring
    }),
    getErrorPath: () => _SlackUtils.SlackUtils.errorUrl("unauthenticated")
  }), async ctx => {
    const {
      code,
      error,
      state
    } = ctx.input.query;
    const {
      user
    } = ctx.state.auth;
    if (error) {
      ctx.redirect(_SlackUtils.SlackUtils.errorUrl(error));
      return;
    }
    const parsedState = _SlackUtils.SlackUtils.parseState(state);
    if (!parsedState) {
      throw (0, _errors.ValidationError)("Invalid state");
    }
    (0, _oauth.verifyOAuthStateNonce)(ctx, _SlackUtils.SlackOAuthNonceCookie, parsedState.nonce);
    const {
      collectionId,
      type
    } = parsedState;
    switch (type) {
      case _types.IntegrationType.Post:
        {
          if (!collectionId) {
            throw (0, _errors.ValidationError)("collectionId is required");
          }
          const collection = await _models.Collection.findByPk(collectionId, {
            userId: user.id
          });
          (0, _policies.authorize)(user, "read", collection);
          (0, _policies.authorize)(user, "update", user.team);

          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _database.sequelize.transaction(async transaction => {
            const authentication = await _models.IntegrationAuthentication.create({
              service: _types.IntegrationService.Slack,
              userId: user.id,
              teamId: user.teamId,
              token: data.access_token,
              scopes: data.scope.split(",")
            }, {
              transaction
            });
            await _models.Integration.create({
              service: _types.IntegrationService.Slack,
              type: _types.IntegrationType.Post,
              userId: user.id,
              teamId: user.teamId,
              authenticationId: authentication.id,
              collectionId,
              events: ["documents.update", "documents.publish"],
              settings: {
                url: data.incoming_webhook.url,
                channel: data.incoming_webhook.channel,
                channelId: data.incoming_webhook.channel_id
              }
            }, {
              transaction
            });
          });
          break;
        }
      case _types.IntegrationType.Command:
        {
          (0, _policies.authorize)(user, "update", user.team);

          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _database.sequelize.transaction(async transaction => {
            const authentication = await _models.IntegrationAuthentication.create({
              service: _types.IntegrationService.Slack,
              userId: user.id,
              teamId: user.teamId,
              token: data.access_token,
              scopes: data.scope.split(",")
            }, {
              transaction
            });
            await _models.Integration.create({
              service: _types.IntegrationService.Slack,
              type: _types.IntegrationType.Command,
              userId: user.id,
              teamId: user.teamId,
              authenticationId: authentication.id,
              settings: {
                serviceTeamId: data.team_id
              }
            }, {
              transaction
            });
          });
          break;
        }
      case _types.IntegrationType.LinkedAccount:
        {
          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _models.Integration.create({
            service: _types.IntegrationService.Slack,
            type: _types.IntegrationType.LinkedAccount,
            userId: user.id,
            teamId: user.teamId,
            settings: {
              slack: {
                serviceUserId: data.user_id,
                serviceTeamId: data.team_id
              }
            }
          });
          break;
        }
      default:
        throw (0, _errors.ValidationError)("Invalid integration type");
    }
    ctx.redirect(_SlackUtils.SlackUtils.url);
  });
}
var _default = exports.default = router;