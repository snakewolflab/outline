"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _domains = require("../../../../shared/utils/domains");
var _InviteAcceptedEmail = _interopRequireDefault(require("../../../../server/emails/templates/InviteAcceptedEmail"));
var _SigninEmail = _interopRequireDefault(require("../../../../server/emails/templates/SigninEmail"));
var _WelcomeEmail = _interopRequireDefault(require("../../../../server/emails/templates/WelcomeEmail"));
var _env = _interopRequireDefault(require("../../../../server/env"));
var _errors = require("../../../../server/errors");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _rateLimiter = require("../../../../server/middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _RateLimiter = require("../../../../server/utils/RateLimiter");
var _VerificationCode = require("../../../../server/utils/VerificationCode");
var _authentication = require("../../../../server/utils/authentication");
var _jwt = require("../../../../server/utils/jwt");
var _passport = require("../../../../server/utils/passport");
var T = _interopRequireWildcard(require("./schema"));
var _constants = require("../../../../shared/constants");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("email", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _validate.default)(T.EmailSchema), async ctx => {
  const {
    email,
    client,
    preferOTP
  } = ctx.input.body;
  const domain = (0, _domains.parseDomain)(ctx.request.hostname);
  let team;
  if (!_env.default.isCloudHosted) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne();
  } else if (domain.custom) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        domain: domain.host.toLowerCase()
      }
    });
  } else if (domain.teamSubdomain) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        subdomain: domain.teamSubdomain
      }
    });
  }
  if (!team?.emailSigninEnabled) {
    throw (0, _errors.AuthorizationError)();
  }
  const user = await _models.User.scope("withAuthentications").findOne({
    where: {
      teamId: team.id,
      email: email.toLowerCase()
    }
  });
  if (!user) {
    ctx.body = {
      success: true
    };
    return;
  }

  // If the user matches an email address associated with an SSO
  // provider then just forward them directly to that sign-in page
  if (user.authentications.length) {
    const authenticationProvider = user.authentications[0].authenticationProvider;
    ctx.body = {
      redirect: `${team.url}/auth/${authenticationProvider?.name}`
    };
    return;
  }

  // Generate both a link token and a 6-digit verification code
  const token = preferOTP ? undefined : user.getEmailSigninToken(ctx);
  const verificationCode = preferOTP ? await user.getEmailVerificationCode() : undefined;

  // send email to users email address with a short-lived token and code
  await new _SigninEmail.default({
    to: user.email,
    language: user.language,
    token,
    teamUrl: team.url,
    client,
    verificationCode
  }).schedule();
  user.lastSigninEmailSentAt = new Date();
  await user.save();

  // respond with success regardless of whether an email was sent
  ctx.body = {
    success: true
  };
});
const emailCallback = async ctx => {
  const {
    query,
    body
  } = ctx.input;
  const token = query?.token || body?.token;
  const client = query?.client || body?.client || _types.Client.Web;
  const follow = query?.follow || body?.follow;
  const code = query?.code || body?.code;
  const email = query?.email || body?.email;

  // The link in the email does not include the follow query param, this
  // is to help prevent anti-virus, and email clients from pre-fetching the link
  // and spending the token before the user clicks on it. Instead we redirect
  // to the same URL with the follow query param added from the client side.
  if (!follow) {
    const csrfToken = ctx.cookies.get(_constants.CSRF.cookieName);

    // Parse the current URL to extract existing query parameters
    const url = new URL(ctx.request.href);
    const searchParams = url.searchParams;

    // Add new parameters
    searchParams.set("follow", "true");
    if (csrfToken) {
      searchParams.set(_constants.CSRF.fieldName, csrfToken);
    }

    // Reconstruct the URL with merged parameters
    url.search = searchParams.toString();
    return ctx.redirectOnClient(url.toString(), "POST");
  }
  let user = null;
  try {
    if (token) {
      user = await (0, _jwt.getUserForEmailSigninToken)(ctx, token);
    } else if (code && email) {
      const team = await (0, _passport.getTeamFromContext)(ctx);
      if (!team) {
        ctx.redirect("/?notice=auth-error&description=Unknown%20team");
        return;
      }
      user = await _models.User.scope("withTeam").findOne({
        where: {
          teamId: team.id,
          email: email.trim().toLowerCase()
        }
      });
      if (!user || !(await _VerificationCode.VerificationCode.verify(team.id, email, code))) {
        ctx.redirect(`/?notice=invalid-code`);
        return;
      }

      // Delete the code after successful verification
      await _VerificationCode.VerificationCode.delete(team.id, email);
    } else {
      ctx.redirect("/?notice=auth-error&description=Missing%20token");
      return;
    }
  } catch (err) {
    const message = (0, _error.errToString)(err);
    _Logger.default.debug("authentication", message);
    return ctx.redirect(`/?notice=auth-error&description=${encodeURIComponent(message)}`);
  }
  if (!user) {
    return ctx.redirect(`/?notice=invalid-code`);
  }
  if (!user.team.emailSigninEnabled) {
    return ctx.redirect("/?notice=auth-error&description=Disabled%20signin%20method");
  }
  if (user.isSuspended) {
    return ctx.redirect("/?notice=user-suspended");
  }
  if (user.isInvited) {
    await new _WelcomeEmail.default({
      to: user.email,
      language: user.language,
      role: user.role,
      teamUrl: user.team.url
    }).schedule();
    const inviter = await user.$get("invitedBy");
    if (inviter?.subscribedToEventType(_types.NotificationEventType.InviteAccepted)) {
      await new _InviteAcceptedEmail.default({
        to: inviter.email,
        language: inviter.language,
        inviterId: inviter.id,
        invitedName: user.name,
        teamUrl: user.team.url
      }).schedule();
    }
  }

  // set cookies on response and redirect to team subdomain
  await (0, _authentication.signIn)(ctx, "email", {
    user,
    team: user.team,
    isNewTeam: false,
    isNewUser: false,
    client
  });
};
router.get("email.callback", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerMinute), (0, _validate.default)(T.EmailCallbackSchema), emailCallback);
router.post("email.callback", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerMinute), (0, _validate.default)(T.EmailCallbackSchema), emailCallback);
var _default = exports.default = router;