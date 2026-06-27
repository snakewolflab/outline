"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _passportAzureAdOauth = require("@outlinewiki/passport-azure-ad-oauth2");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _error = require("../../../../shared/utils/error");
var _domains = require("../../../../shared/utils/domains");
var _email = require("../../../../shared/utils/email");
var _accountProvisioner = _interopRequireDefault(require("../../../../server/commands/accountProvisioner"));
var _errors = require("../../../../server/errors");
var _passport = _interopRequireDefault(require("../../../../server/middlewares/passport"));
var _passport2 = require("../../../../server/utils/passport");
var _plugin = _interopRequireDefault(require("../../plugin.json"));
var _env = _interopRequireDefault(require("../env"));
var _context = require("../../../../server/context");
var _fetch = _interopRequireDefault(require("../../../../server/utils/fetch"));
var _UploadUserAvatarTask = _interopRequireDefault(require("../../../../server/queues/tasks/UploadUserAvatarTask"));
var _AttachmentHelper = _interopRequireDefault(require("../../../../server/models/helpers/AttachmentHelper"));
var _types = require("../../../../shared/types");
var _User = require("../../../../server/models/User");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const scopes = [];

/**
 * Loads the user's profile photo from the Microsoft Graph API and encodes it as
 * a data URL. Entra ID does not emit a `picture` claim in the ID token, so the
 * photo is only available via Graph. Requires no additional permissions beyond
 * the delegated `User.Read` already used to load the profile.
 *
 * @param accessToken The delegated access token for the Microsoft Graph API.
 * @returns A base64 encoded data URL for the photo, or undefined if not set.
 */
async function requestPhoto(accessToken) {
  try {
    const response = await (0, _fetch.default)("https://graph.microsoft.com/v1.0/me/photo/$value", {
      method: "GET",
      allowPrivateIPAddress: true,
      // Cap how long we'll wait and how many bytes we'll buffer so a slow or
      // oversized response can never stall the login callback.
      timeout: 10000,
      size: _AttachmentHelper.default.presetToMaxUploadSize(_types.AttachmentPreset.Avatar),
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // A missing photo returns 404, which we can safely ignore.
    if (!response.ok) {
      return undefined;
    }
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = await response.buffer();
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (_err) {
    return undefined;
  }
}
if (_env.default.AZURE_CLIENT_ID && _env.default.AZURE_CLIENT_SECRET) {
  const strategy = new _passportAzureAdOauth.Strategy({
    clientID: _env.default.AZURE_CLIENT_ID,
    clientSecret: _env.default.AZURE_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/azure.callback`,
    useCommonEndpoint: _env.default.AZURE_TENANT_ID ? false : true,
    tenant: _env.default.AZURE_TENANT_ID ? _env.default.AZURE_TENANT_ID : undefined,
    passReqToCallback: true,
    resource: _env.default.AZURE_RESOURCE_APP_ID,
    // @ts-expect-error StateStore
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (context, accessToken, refreshToken, params, _profile, done) {
    try {
      // see docs for what the fields in profile represent here:
      // https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
      const profile = _jsonwebtoken.default.decode(params.id_token);
      const [profileResponse, organizationResponse] = await Promise.all([
      // Load the users profile from the Microsoft Graph API
      // https://docs.microsoft.com/en-us/graph/api/resources/users?view=graph-rest-1.0
      (0, _passport2.request)("GET", `https://graph.microsoft.com/v1.0/me`, accessToken),
      // Load the organization profile from the Microsoft Graph API
      // https://docs.microsoft.com/en-us/graph/api/organization-get?view=graph-rest-1.0
      (0, _passport2.request)("GET", `https://graph.microsoft.com/v1.0/organization`, accessToken)]);
      if (!profileResponse) {
        throw (0, _errors.MicrosoftGraphError)("Unable to load user profile from Microsoft Graph API");
      }
      if (!organizationResponse?.value?.length) {
        throw (0, _errors.MicrosoftGraphError)(`Unable to load organization info from Microsoft Graph API: ${organizationResponse.error?.message}`);
      }
      const organization = organizationResponse.value[0];

      // Note: userPrincipalName is last here for backwards compatibility with
      // previous versions of Outline that did not include it.
      const email = profile.email || profileResponse.mail || profileResponse.userPrincipalName;
      if (!email) {
        throw (0, _errors.MicrosoftGraphError)("'email' property is required but could not be found in user profile.");
      }
      const team = await (0, _passport2.getTeamFromContext)(context);
      const client = (0, _passport2.getClientFromOAuthState)(context);
      const user = context.state?.auth?.user ?? (await (0, _passport2.getUserFromOAuthState)(context));

      // The mail and userPrincipalName values come from the directory via the
      // Graph API and are owned by the organization, so an email sourced from
      // them is inherently trusted. Microsoft's mutable `email` token claim is
      // only trusted when a verification claim confirms it — xms_edov for
      // workforce tenants, or the standard email_verified claim in External ID
      // / OIDC scenarios.
      // https://learn.microsoft.com/en-us/entra/identity-platform/reference-claims-customization
      const directoryEmails = [profileResponse.mail, profileResponse.userPrincipalName].filter(Boolean).map(value => value.toLowerCase());
      const verificationClaims = [profile.xms_edov, profile.email_verified].filter(claim => claim !== undefined);
      const emailVerified = directoryEmails.includes(email.toLowerCase()) || (verificationClaims.length ? verificationClaims.some(claim => claim === true || claim === "true") : undefined);
      const domain = (0, _email.parseEmail)(email).domain;
      const subdomain = (0, _domains.slugifyDomain)(domain);
      const teamName = organization.displayName;
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
          name: profile.name,
          email,
          emailVerified,
          avatarUrl: profile.picture
        },
        authenticationProvider: {
          name: _plugin.default.id,
          providerId: profile.tid
        },
        authentication: {
          providerId: profile.oid,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes
        }
      });
      // Entra ID does not include the photo in the token, so it must be
      // fetched separately from Graph. To avoid the extra round-trip on every
      // sign-in we only do so when the user has no avatar yet and hasn't set
      // one manually — this also backfills accounts created before avatar
      // syncing was supported, and stops once an avatar is stored.
      if (!result.user.avatarUrl && !result.user.getFlag(_User.UserFlag.AvatarUpdated)) {
        const avatarUrl = await requestPhoto(accessToken);
        if (avatarUrl) {
          await new _UploadUserAvatarTask.default().schedule({
            userId: result.user.id,
            avatarUrl
          });
        }
      }
      return done(null, result.user, {
        ...result,
        client
      });
    } catch (err) {
      return done((0, _error.toError)(err), null);
    }
  });
  _koaPassport.default.use(strategy);
  router.get(_plugin.default.id, _passport2.startOAuthFlow, _koaPassport.default.authenticate(_plugin.default.id, {
    prompt: "select_account"
  }));
  router.get(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
}
var _default = exports.default = router;