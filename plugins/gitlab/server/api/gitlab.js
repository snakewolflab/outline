"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _context = require("../../../../server/context");
var _errors = require("../../../../server/errors");
var _apexAuthRedirect = _interopRequireDefault(require("../../../../server/middlewares/apexAuthRedirect"));
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _transaction = require("../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _validateWebhook = _interopRequireDefault(require("../../../../server/middlewares/validateWebhook"));
var _models = require("../../../../server/models");
var _policies = require("../../../../server/policies");
var _oauth = require("../../../../server/utils/oauth");
var _url = require("../../../../server/utils/url");
var _dateFns = require("date-fns");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _GitLabUtils = require("../../shared/GitLabUtils");
var _gitlab = require("../gitlab");
var _env = _interopRequireDefault(require("../env"));
var _GitLabWebhookTask = _interopRequireDefault(require("../tasks/GitLabWebhookTask"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("gitlab.connect", (0, _authentication.default)(), (0, _validate.default)(T.GitLabConnectSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    url: rawUrl,
    clientId,
    clientSecret
  } = ctx.input.body;
  const url = rawUrl?.replace(/\/+$/, "");
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  (0, _policies.authorize)(user, "createIntegration", user.team);
  if (url) {
    await (0, _url.validateUrlNotPrivate)(url);
  }
  if (url && clientId && clientSecret) {
    // Clean up any stale pending auth records for this user/team/service
    await _models.IntegrationAuthentication.destroy({
      where: {
        service: _types.IntegrationService.GitLab,
        userId: user.id,
        teamId: user.teamId,
        token: {
          [_sequelize.Op.is]: null
        }
      },
      transaction
    });

    // Check if an integration already exists for this GitLab URL
    const existing = await _models.Integration.findOne({
      where: {
        service: _types.IntegrationService.GitLab,
        teamId: user.teamId,
        settings: {
          gitlab: {
            url
          }
        }
      },
      include: [{
        model: _models.IntegrationAuthentication,
        as: "authentication",
        required: false
      }],
      transaction
    });
    if (existing?.authentication) {
      // Update the existing authentication with new credentials and
      // clear tokens so the callback treats it as pending
      existing.authentication.clientId = clientId;
      existing.authentication.clientSecret = clientSecret;
      existing.authentication.setDataValue("token", null);
      existing.authentication.setDataValue("refreshToken", null);
      await existing.authentication.save({
        transaction
      });
    } else {
      // Create a pending IntegrationAuthentication with credentials
      const pendingAuth = await _models.IntegrationAuthentication.create({
        service: _types.IntegrationService.GitLab,
        userId: user.id,
        teamId: user.teamId,
        clientId,
        clientSecret
      }, {
        transaction
      });
      if (existing) {
        // Link existing integration to the new authentication
        await existing.update({
          authenticationId: pendingAuth.id
        }, {
          transaction
        });
      } else {
        // Create a new integration with the URL and link it
        await _models.Integration.create({
          service: _types.IntegrationService.GitLab,
          type: _types.IntegrationType.Embed,
          userId: user.id,
          teamId: user.teamId,
          authenticationId: pendingAuth.id,
          settings: {
            gitlab: {
              url
            }
          }
        }, {
          transaction
        });
      }
    }
  }
  const nonce = (0, _oauth.generateOAuthStateNonce)(ctx, _GitLabUtils.GitLabOAuthNonceCookie);
  const redirectUrl = _GitLabUtils.GitLabUtils.authUrl({
    teamId: user.teamId,
    nonce
  }, url, clientId);
  ctx.body = {
    data: {
      redirectUrl
    }
  };
});
router.get("gitlab.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.GitLabCallbackSchema), (0, _apexAuthRedirect.default)({
  getTeamId: ctx => _GitLabUtils.GitLabUtils.parseState(ctx.input.query.state)?.teamId,
  getRedirectPath: (ctx, team) => _GitLabUtils.GitLabUtils.callbackUrl({
    baseUrl: team.url,
    params: ctx.request.querystring
  }),
  getErrorPath: () => _GitLabUtils.GitLabUtils.errorUrl("unauthenticated")
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
  if (error) {
    ctx.redirect(_GitLabUtils.GitLabUtils.errorUrl(error));
    return;
  }
  const parsedState = _GitLabUtils.GitLabUtils.parseState(state);
  if (!parsedState) {
    throw (0, _errors.ValidationError)("Invalid state");
  }
  (0, _oauth.verifyOAuthStateNonce)(ctx, _GitLabUtils.GitLabOAuthNonceCookie, parsedState.nonce);
  try {
    // Check for a pending IntegrationAuthentication with custom credentials
    const pendingAuth = await _models.IntegrationAuthentication.findOne({
      where: {
        service: _types.IntegrationService.GitLab,
        userId: user.id,
        teamId: user.teamId,
        token: {
          [_sequelize.Op.is]: null
        }
      },
      transaction
    });

    // Resolve the custom URL from the linked Integration (if any)
    let customUrl;
    let existingIntegration = null;
    if (pendingAuth) {
      existingIntegration = await _models.Integration.findOne({
        where: {
          service: _types.IntegrationService.GitLab,
          teamId: user.teamId,
          authenticationId: pendingAuth.id
        },
        transaction
      });
      customUrl = existingIntegration?.settings?.gitlab?.url;
    }
    const oauth = await _gitlab.GitLab.oauthAccess({
      code,
      customUrl,
      clientId: pendingAuth?.clientId ?? undefined,
      clientSecret: pendingAuth?.clientSecret ?? undefined
    });
    const userInfo = await _gitlab.GitLab.getCurrentUser({
      accessToken: oauth.access_token,
      customUrl
    });

    // Check if another integration already exists with the same installation
    const duplicateIntegration = await _models.Integration.findOne({
      where: {
        service: _types.IntegrationService.GitLab,
        teamId: user.teamId,
        settings: {
          gitlab: {
            installation: {
              id: userInfo.id
            }
          }
        },
        ...(existingIntegration ? {
          id: {
            [_sequelize.Op.ne]: existingIntegration.id
          }
        } : {})
      },
      transaction
    });
    if (duplicateIntegration) {
      ctx.redirect(_GitLabUtils.GitLabUtils.errorUrl("duplicate_account"));
      return;
    }
    let authentication;
    if (pendingAuth) {
      // Update the pending record with OAuth tokens
      await pendingAuth.update({
        token: oauth.access_token,
        refreshToken: oauth.refresh_token,
        expiresAt: oauth.expires_in ? (0, _dateFns.addSeconds)(Date.now(), oauth.expires_in) : undefined,
        scopes: oauth.scope.split(" ")
      }, {
        transaction
      });
      authentication = pendingAuth;
    } else {
      authentication = await _models.IntegrationAuthentication.create({
        service: _types.IntegrationService.GitLab,
        userId: user.id,
        teamId: user.teamId,
        token: oauth.access_token,
        refreshToken: oauth.refresh_token,
        expiresAt: oauth.expires_in ? (0, _dateFns.addSeconds)(Date.now(), oauth.expires_in) : undefined,
        scopes: oauth.scope.split(" ")
      }, {
        transaction
      });
    }
    const installationSettings = {
      gitlab: {
        ...(customUrl ? {
          url: customUrl
        } : {}),
        installation: {
          id: userInfo.id,
          account: {
            id: userInfo.id,
            name: userInfo.username,
            avatarUrl: userInfo.avatar_url
          }
        }
      }
    };
    if (existingIntegration) {
      // Update the existing Integration created during gitlab.connect
      existingIntegration.settings = installationSettings;
      await existingIntegration.save({
        transaction
      });
    } else {
      await _models.Integration.createWithCtx((0, _context.createContext)({
        user,
        transaction
      }), {
        service: _types.IntegrationService.GitLab,
        type: _types.IntegrationType.Embed,
        userId: user.id,
        teamId: user.teamId,
        authenticationId: authentication.id,
        settings: installationSettings
      });
    }
    ctx.redirect(_GitLabUtils.GitLabUtils.url);
  } catch (err) {
    _Logger.default.error("Encountered error during Gitlab OAuth callback", (0, _error.toError)(err));
    ctx.redirect(_GitLabUtils.GitLabUtils.errorUrl("unauthenticated"));
  }
});
router.post("gitlab.webhooks", (0, _validateWebhook.default)({
  hmacSign: false,
  secretKey: async ctx => {
    const instanceHeader = ctx.request.headers["x-gitlab-instance"];
    const instanceUrl = (Array.isArray(instanceHeader) ? instanceHeader[0] : instanceHeader)?.replace(/\/+$/, "");

    // Self-hosted instances store their client secret in the database,
    // use the X-Gitlab-Instance header to find the matching integration.
    if (instanceUrl && instanceUrl !== "https://gitlab.com") {
      const integration = await _models.Integration.findOne({
        where: {
          service: _types.IntegrationService.GitLab,
          settings: {
            gitlab: {
              url: instanceUrl
            }
          }
        },
        include: [{
          model: _models.IntegrationAuthentication,
          as: "authentication",
          required: true
        }]
      });
      if (integration) {
        return integration.authentication.clientSecret ?? undefined;
      }
    }

    // Default GitLab.com instance uses the env secret
    return _env.default.GITLAB_CLIENT_SECRET;
  },
  getSignatureFromHeader: ctx => {
    const {
      headers
    } = ctx.request;
    const signatureHeader = headers["x-gitlab-token"];
    return Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  }
}), async ctx => {
  const {
    headers,
    body
  } = ctx.request;
  await new _GitLabWebhookTask.default().schedule({
    payload: body,
    headers
  });
  ctx.status = 202;
});
var _default = exports.default = router;