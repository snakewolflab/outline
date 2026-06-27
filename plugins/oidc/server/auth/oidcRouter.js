"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOIDCRouter = createOIDCRouter;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _dateFns = require("date-fns");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _compat = require("es-toolkit/compat");
var _error = require("../../../../shared/utils/error");
var _domains = require("../../../../shared/utils/domains");
var _email = require("../../../../shared/utils/email");
var _urls = require("../../../../shared/utils/urls");
var _accountProvisioner = _interopRequireDefault(require("../../../../server/commands/accountProvisioner"));
var _errors = require("../../../../server/errors");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _passport = _interopRequireDefault(require("../../../../server/middlewares/passport"));
var _models = require("../../../../server/models");
var _passport2 = require("../../../../server/utils/passport");
var _plugin = _interopRequireDefault(require("../../plugin.json"));
var _env = _interopRequireDefault(require("../env"));
var _OIDCStrategy = require("./OIDCStrategy");
var _context = require("../../../../server/context");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const OIDC_LOGOUT_PATH = "/auth/oidc.logout";
/**
 * Creates OIDC routes and mounts them into the provided router
 */
function createOIDCRouter(router, endpoints) {
  const scopes = _env.default.OIDC_SCOPES.split(" ");
  _koaPassport.default.use(_plugin.default.id, new _OIDCStrategy.OIDCStrategy({
    authorizationURL: endpoints.authorizationURL,
    tokenURL: endpoints.tokenURL,
    clientID: _env.default.OIDC_CLIENT_ID,
    clientSecret: _env.default.OIDC_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/${_plugin.default.id}.callback`,
    passReqToCallback: true,
    scope: _env.default.OIDC_SCOPES,
    // @ts-expect-error custom state store
    store: new _passport2.StateStore(endpoints.pkce),
    state: true,
    pkce: endpoints.pkce ?? false
  },
  // OpenID Connect standard profile claims can be found in the official
  // specification.
  // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
  // Non-standard claims may be configured by individual identity providers.
  // Any claim supplied in response to the userinfo request will be
  // available on the `profile` parameter
  async function (context, accessToken, refreshToken, params, _profile, done) {
    try {
      // Some providers require a POST request to the userinfo endpoint, add them as exceptions here.
      const usePostMethod = ["https://api.dropboxapi.com/2/openid/userinfo"];
      const profile = await (0, _passport2.request)(usePostMethod.includes(endpoints.userInfoURL) ? "POST" : "GET", endpoints.userInfoURL, accessToken);

      // Some providers, namely ADFS, don't provide anything more than the `sub` claim in the userinfo endpoint
      // So, we'll decode the params.id_token and see if that contains what we need.
      const token = (() => {
        try {
          const decoded = _jsonwebtoken.default.decode(params.id_token);
          if (!decoded || typeof decoded !== "object") {
            _Logger.default.warn("Decoded id_token is not a valid object");
            return {};
          }
          return decoded;
        } catch (err) {
          _Logger.default.error("id_token decode threw error: ", (0, _error.toError)(err));
          return {};
        }
      })();
      const email = profile.email ?? token.email ?? null;
      if (!email) {
        throw (0, _errors.AuthenticationError)(`An email field was not returned in the profile or id_token parameter, but is required.`);
      }

      // The email_verified claim is part of the OIDC standard claims.
      // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
      const emailVerifiedClaim = profile.email_verified ?? token.email_verified;
      const emailVerified = emailVerifiedClaim === undefined ? undefined : emailVerifiedClaim === true || emailVerifiedClaim === "true";
      const team = await (0, _passport2.getTeamFromContext)(context);
      const client = (0, _passport2.getClientFromOAuthState)(context);
      const user = context.state?.auth?.user ?? (await (0, _passport2.getUserFromOAuthState)(context));
      const {
        domain
      } = (0, _email.parseEmail)(email);

      // Only a single OIDC provider is supported – find the existing, if any.
      const authenticationProvider = team ? (await _models.AuthenticationProvider.findOne({
        where: {
          name: "oidc",
          teamId: team.id,
          providerId: domain
        }
      })) ?? (await _models.AuthenticationProvider.findOne({
        where: {
          name: "oidc",
          teamId: team.id
        }
      })) : undefined;

      // Derive a providerId from the OIDC location if there is no existing provider.
      const oidcURL = new URL(endpoints.authorizationURL);
      const providerId = authenticationProvider?.providerId ?? oidcURL.hostname;
      if (!domain) {
        throw (0, _errors.OIDCMalformedUserInfoError)();
      }

      // remove the TLD and form a subdomain from the remaining
      const subdomain = (0, _domains.slugifyDomain)(domain);

      // Claim name can be overriden using an env variable.
      // Default is 'preferred_username' as per OIDC spec.
      // This will default to the profile.preferred_username, but will fall back to preferred_username from the id_token
      const username = (0, _compat.get)(profile, _env.default.OIDC_USERNAME_CLAIM) ?? (0, _compat.get)(token, _env.default.OIDC_USERNAME_CLAIM);
      const name = profile.name || username || profile.username;
      const profileId = profile.sub ?? token.sub ?? profile.id;
      if (!name) {
        throw (0, _errors.AuthenticationError)(`Neither a ${_env.default.OIDC_USERNAME_CLAIM}, "name" or "username" was returned in the profile loaded from ${endpoints.userInfoURL}, but at least one is required.`);
      }
      if (!profileId) {
        throw (0, _errors.AuthenticationError)(`A user id was not returned in the profile loaded from ${endpoints.userInfoURL}, searched in "sub" and "id" fields.`);
      }

      // Check if the picture field is a Base64 data URL and filter it out
      // to avoid validation errors in the User model
      let avatarUrl = profile.picture;
      if (profile.picture && (0, _urls.isBase64Url)(profile.picture)) {
        _Logger.default.debug("authentication", "Filtering out Base64 data URL from avatar", {
          email
        });
        avatarUrl = null;
      }
      const ctx = (0, _context.createContext)({
        ip: context.ip,
        user,
        authType: context.state?.auth?.type
      });
      const result = await (0, _accountProvisioner.default)(ctx, {
        team: {
          teamId: team?.id,
          name: _env.default.APP_NAME,
          domain,
          subdomain
        },
        user: {
          name,
          email,
          emailVerified,
          avatarUrl
        },
        authenticationProvider: {
          name: _plugin.default.id,
          providerId
        },
        authentication: {
          providerId: profileId,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes: params.scope ? params.scope.split(" ") : scopes
        }
      });
      // Persist the id_token so a later RP-initiated logout can pass it as
      // the `id_token_hint`, allowing the provider to scope the logout to
      // this session rather than terminating its global SSO session.
      if (endpoints.logoutURL && params.id_token) {
        context.cookies.set("oidcIdToken", params.id_token, {
          httpOnly: true,
          sameSite: "lax",
          secure: _env.default.isProduction,
          path: OIDC_LOGOUT_PATH,
          domain: (0, _domains.getCookieDomain)(context.request.hostname, _env.default.isCloudHosted),
          expires: (0, _dateFns.addMonths)(new Date(), 3)
        });
      }
      return done(null, result.user, {
        ...result,
        client
      });
    } catch (err) {
      return done((0, _error.toError)(err), null);
    }
  }));
  router.get(_plugin.default.id, _passport2.startOAuthFlow, _koaPassport.default.authenticate(_plugin.default.id));
  router.get(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
  router.post(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));

  // Performs a spec-compliant RP-initiated logout against the provider's end
  // session endpoint. Passing `id_token_hint` identifies the session being
  // ended so the provider can scope the logout and skip a confirmation prompt,
  // while `post_logout_redirect_uri` returns the user to Outline afterwards.
  // https://openid.net/specs/openid-connect-rpinitiated-1_0.html
  router.get(`${_plugin.default.id}.logout`, ctx => {
    const idToken = ctx.cookies.get("oidcIdToken");

    // Always discard our copy of the id_token, regardless of where we redirect.
    ctx.cookies.set("oidcIdToken", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: _env.default.isProduction,
      path: OIDC_LOGOUT_PATH,
      domain: (0, _domains.getCookieDomain)(ctx.request.hostname, _env.default.isCloudHosted),
      expires: (0, _dateFns.subMinutes)(new Date(), 1)
    });
    if (!endpoints.logoutURL) {
      return ctx.redirect("/");
    }
    try {
      const url = new URL(endpoints.logoutURL);
      if (idToken) {
        url.searchParams.set("id_token_hint", idToken);
      }
      if (_env.default.OIDC_CLIENT_ID) {
        url.searchParams.set("client_id", _env.default.OIDC_CLIENT_ID);
      }
      url.searchParams.set("post_logout_redirect_uri", _env.default.URL);
      return ctx.redirect(url.toString());
    } catch (err) {
      _Logger.default.warn("Invalid OIDC logout URL", {
        error: (0, _error.toError)(err).message
      });
      return ctx.redirect("/");
    }
  });
}