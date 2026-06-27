"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _passportGoogleOauth = require("passport-google-oauth2");
var _error = require("../../../../shared/utils/error");
var _i18n = require("../../../../shared/i18n");
var _domains = require("../../../../shared/utils/domains");
var _accountProvisioner = _interopRequireDefault(require("../../../../server/commands/accountProvisioner"));
var _errors = require("../../../../server/errors");
var _passport = _interopRequireDefault(require("../../../../server/middlewares/passport"));
var _models = require("../../../../server/models");
var _passport2 = require("../../../../server/utils/passport");
var _plugin = _interopRequireDefault(require("../../plugin.json"));
var _env = _interopRequireDefault(require("../env"));
var _context = require("../../../../server/context");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const scopes = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"];
if (_env.default.GOOGLE_CLIENT_ID && _env.default.GOOGLE_CLIENT_SECRET) {
  _koaPassport.default.use(new _passportGoogleOauth.Strategy({
    clientID: _env.default.GOOGLE_CLIENT_ID,
    clientSecret: _env.default.GOOGLE_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/${_plugin.default.id}.callback`,
    passReqToCallback: true,
    // @ts-expect-error StateStore
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (context, accessToken, refreshToken, params, profile, done) {
    try {
      // "domain" is the Google Workspaces domain
      const domain = profile._json.hd;
      let team = await (0, _passport2.getTeamFromContext)(context);
      const client = (0, _passport2.getClientFromOAuthState)(context);
      const user = context.state?.auth?.user ?? (await (0, _passport2.getUserFromOAuthState)(context));

      // No profile domain means a personal gmail account, and no team means
      // the request came from the apex domain rather than a workspace
      // subdomain. We can't infer the workspace from the domain, so resolve
      // it from the verified email's existing accounts instead.
      if (!domain && !team) {
        const existingAccounts = await _models.User.findAll({
          attributes: ["id", "teamId"],
          where: {
            email: profile.email.toLowerCase()
          },
          include: [{
            association: "team",
            required: true
          }]
        });
        const teamIds = new Set(existingAccounts.map(account => account.teamId));

        // A personal gmail account cannot be used to create a new workspace.
        if (teamIds.size === 0) {
          throw (0, _errors.GmailAccountCreationError)();
        }

        // When the email belongs to more than one workspace it is ambiguous
        // which to sign into, so the user must start from its subdomain.
        if (teamIds.size > 1) {
          throw (0, _errors.TeamDomainRequiredError)();
        }

        // Belongs to exactly one workspace — resolve it and sign in there.
        team = existingAccounts[0].team;
      }

      // remove the TLD and form a subdomain from the remaining
      // subdomains of the form "foo.bar.com" are allowed as primary Google Workspaces domains
      // see https://support.google.com/nonprofits/thread/19685140/using-a-subdomain-as-a-primary-domain
      const subdomain = domain ? (0, _domains.slugifyDomain)(domain) : "";
      const teamName = (0, _compat.capitalize)(subdomain);

      // Request a larger size profile picture than the default by tweaking
      // the query parameter.
      const avatarUrl = profile.picture.replace("=s96-c", "=s128-c");
      const locale = profile._json.locale;
      const language = locale ? _i18n.languages.find(l => l.startsWith(locale)) : undefined;

      // if a team can be inferred, we assume the user is only interested in signing into
      // that team in particular; otherwise, we will do a best effort at finding their account
      // or provisioning a new one (within AccountProvisioner)
      const ctx = (0, _context.createContext)({
        ip: context.ip,
        user,
        authType: context.state?.auth?.type
      });
      const result = await (0, _accountProvisioner.default)(ctx, {
        team: {
          teamId: team?.id,
          name: teamName,
          domain,
          subdomain
        },
        user: {
          email: profile.email,
          // Google only returns confirmed workspace email addresses.
          emailVerified: true,
          name: profile.displayName,
          language,
          avatarUrl
        },
        authenticationProvider: {
          name: _plugin.default.id,
          providerId: domain ?? ""
        },
        authentication: {
          providerId: profile.id,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes: params.scope ? params.scope.split(" ") : scopes
        }
      });
      return done(null, result.user, {
        ...result,
        client
      });
    } catch (err) {
      return done((0, _error.toError)(err), null);
    }
  }));
  router.get(_plugin.default.id, _passport2.startOAuthFlow, async (ctx, next) => {
    const team = await (0, _passport2.getTeamFromContext)(ctx, {
      includeHostQueryParam: true
    });
    let extraScopes = [];
    if (team) {
      const authProvider = await _models.AuthenticationProvider.findOne({
        where: {
          name: _plugin.default.id,
          teamId: team.id
        }
      });
      if (authProvider?.settings?.groupSyncEnabled) {
        extraScopes = authProvider.settings.groupSyncScopes ?? ["https://www.googleapis.com/auth/admin.directory.group.readonly"];
      }
    }
    return _koaPassport.default.authenticate(_plugin.default.id, {
      accessType: "offline",
      prompt: "select_account consent",
      scope: [...scopes, ...extraScopes]
    })(ctx, next);
  });
  router.get(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
}
var _default = exports.default = router;