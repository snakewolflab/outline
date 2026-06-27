"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMiddleware;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _passportOauth = require("passport-oauth2");
var _types = require("../../shared/types");
var _domains = require("../../shared/utils/domains");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
var _authentication = require("../utils/authentication");
var _passport = require("../utils/passport");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Validates that a host from the OAuth state is a trusted domain. For
 * cloud-hosted deployments, ensures the host is either a known subdomain of
 * the base domain or a registered custom domain.
 *
 * @param host the host to validate.
 * @returns the host if trusted, otherwise falls back to the base domain from env.URL.
 */
async function getValidatedHost(host) {
  const fallback = new URL(_env.default.URL).host;
  if (!_env.default.isCloudHosted) {
    return host;
  }
  if (!host) {
    return fallback;
  }
  const domain = (0, _domains.parseDomain)(host);

  // Subdomains of the base domain are trusted
  if (!domain.custom) {
    return domain.host;
  }

  // Custom domains must be registered to a team
  const team = await _models.Team.findByDomain(domain.host);
  if (team) {
    return domain.host;
  }

  // Unrecognized host, fall back to the base app URL
  return fallback;
}
function createMiddleware(providerName) {
  return function passportMiddleware(ctx) {
    return _koaPassport.default.authorize(providerName, {
      session: false
    }, async (err, user, result) => {
      if (err) {
        // TokenError / AuthorizationError surface input problems reported by
        // the upstream OAuth provider (expired or already-redeemed codes,
        // access_denied, etc). They are not server bugs, so log at warn
        // level and skip the error reporter.
        if (err instanceof _passportOauth.TokenError || err instanceof _passportOauth.AuthorizationError) {
          _Logger.default.warn(`OAuth error during authentication: ${err.message}`, {
            code: err.code
          });
        } else {
          _Logger.default.error("Error during authentication", err instanceof _passportOauth.InternalOAuthError ? err.oauthError : err);
        }
        if (err.id) {
          const notice = err.id.replace(/_/g, "-");
          const redirectPath = err.redirectPath ?? "/";
          const hasQueryString = redirectPath?.includes("?");

          // Every authentication action is routed through the apex domain.
          // But when there is an error, we want to redirect the user on the
          // same domain or subdomain that they originated from (found in state).

          // get original host
          const stateString = typeof ctx.query.state === "string" ? ctx.query.state : undefined;
          const state = stateString ? (0, _passport.parseState)(stateString) : undefined;
          const oauthState = ctx.state.oauthState ?? state;

          // form a URL object with the err.redirectPath and replace the host
          const reqProtocol = oauthState?.client === _types.Client.Desktop ? "outline" : ctx.protocol;
          const requestHost = await getValidatedHost(oauthState?.host ?? ctx.hostname);
          const url = new URL(_env.default.isCloudHosted ? `${reqProtocol}://${requestHost}${redirectPath}` : `${_env.default.URL}${redirectPath}`);
          return ctx.redirect(`${url.toString()}${hasQueryString ? "&" : "?"}notice=${notice}`);
        }
        if (_env.default.isDevelopment) {
          throw err;
        }
        return ctx.redirect(`/?notice=auth-error`);
      }

      // Passport.js may invoke this callback with err=null and user=null in
      // the event that error=access_denied is received from the OAuth server.
      // I'm not sure why this exception to the rule exists, but it does:
      // https://github.com/jaredhanson/passport-oauth2/blob/e20f26aad60ed54f0e7952928cbb64979ef8da2b/lib/strategy.js#L135
      if (!user && !result?.user) {
        _Logger.default.error("No user returned during authentication", (0, _errors.AuthenticationError)());
        return ctx.redirect(`/?notice=auth-error`);
      }

      // Handle errors from Azure which come in the format: message, Trace ID,
      // Correlation ID, Timestamp in these two query string parameters.
      const {
        error,
        error_description
      } = ctx.request.query;
      if (error && error_description) {
        _Logger.default.error("Error from Azure during authentication", new Error(String(error_description)));
        // Display only the descriptive message to the user, log the rest
        const description = String(error_description).split("Trace ID")[0];
        return ctx.redirect(`/?notice=auth-error&description=${description}`);
      }
      if (result.user.isSuspended) {
        return ctx.redirect("/?notice=user-suspended");
      }
      await (0, _authentication.signIn)(ctx, providerName, result);
    })(ctx);
  };
}