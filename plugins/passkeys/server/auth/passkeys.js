"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPasskeyLoginRedirect = exports.getExpectedOrigin = exports.default = void 0;
var _server = require("@simplewebauthn/server");
var _helpers = require("@simplewebauthn/server/helpers");
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _nodeCrypto = require("node:crypto");
var _error = require("../../../../shared/utils/error");
var _models = require("../../../../server/models");
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _env = _interopRequireDefault(require("../../../../server/env"));
var _errors = require("../../../../server/errors");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _redis = _interopRequireDefault(require("../../../../server/storage/redis"));
var _authentication2 = require("../../../../server/utils/authentication");
var _passkeys = require("../../../../shared/utils/passkeys");
var T = _interopRequireWildcard(require("./schema"));
var _types = require("../../../../shared/types");
var _time = require("../../../../shared/utils/time");
var _policies = require("../../../../server/policies");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const rpName = _env.default.APP_NAME;
const CHALLENGE_EXPIRY_MS = _time.Minute.ms * 5;

// Helper to get RP ID (domain) - for simplicity, we can use the hostname but strip port.
const getRpID = ctx => ctx.request.hostname;

/**
 * Helper to get the expected origin for WebAuthn.
 * Properly handles non-standard ports by checking X-Forwarded-Port header.
 *
 * @param ctx - the API context.
 * @returns the expected origin (protocol://host:port).
 */
const getExpectedOrigin = ctx => {
  const protocol = ctx.protocol;
  const hostname = ctx.request.hostname;

  // When behind a proxy with app.proxy = true, Koa uses X-Forwarded-Host
  // which typically doesn't include the port. We need to check X-Forwarded-Port.
  const forwardedPort = ctx.request.get("X-Forwarded-Port");

  // ctx.request.host includes port if present (e.g., "example.com:3000")
  // ctx.request.hostname excludes port (e.g., "example.com")
  const hostWithPort = ctx.request.host;

  // Determine if we need to add a port to the origin
  let origin = `${protocol}://${hostname}`;

  // Check if X-Forwarded-Port exists (when behind a proxy)
  if (forwardedPort) {
    const port = parseInt(forwardedPort, 10);
    // Only add port if it's not the default for the protocol
    if (protocol === "https" && port !== 443 || protocol === "http" && port !== 80) {
      origin = `${protocol}://${hostname}:${port}`;
    }
  } else if (hostWithPort !== hostname) {
    // hostWithPort includes port, use it directly
    origin = `${protocol}://${hostWithPort}`;
  }
  return origin;
};

/**
 * Generate Redis key for registration challenge.
 *
 * @param userId - the user ID.
 * @returns the Redis key.
 */
exports.getExpectedOrigin = getExpectedOrigin;
const getRegistrationChallengeKey = userId => `passkey:reg-challenge:${userId}`;

/**
 * Generate Redis key for authentication challenge.
 *
 * @param challengeId - the challenge ID.
 * @returns the Redis key.
 */
const getAuthenticationChallengeKey = challengeId => `passkey:auth-challenge:${challengeId}`;
router.post("passkeys.generateRegistrationOptions", (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createUserPasskey", user.team);

  // Fetch existing passkeys to exclude them from registration
  const existingPasskeys = await _models.UserPasskey.findAll({
    where: {
      userId: user.id
    }
  });
  const options = await (0, _server.generateRegistrationOptions)({
    rpName,
    rpID: getRpID(ctx),
    userID: _helpers.isoBase64URL.toBuffer(user.id),
    userName: user.email || user.name,
    excludeCredentials: existingPasskeys.map(pk => ({
      id: pk.credentialId,
      transports: pk.transports
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred"
    }
  });

  // Save challenge to Redis with user ID as key
  await _redis.default.defaultClient.set(getRegistrationChallengeKey(user.id), options.challenge, "PX", CHALLENGE_EXPIRY_MS);
  ctx.body = {
    data: options
  };
});
router.post("passkeys.verifyRegistration", (0, _authentication.default)(), (0, _validate.default)(T.PasskeysVerifyRegistrationSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const body = ctx.input.body;
  (0, _policies.authorize)(user, "createUserPasskey", user.team);

  // Retrieve challenge from Redis
  const expectedChallenge = await _redis.default.defaultClient.get(getRegistrationChallengeKey(user.id));
  if (!expectedChallenge) {
    throw (0, _errors.ValidationError)("No registration challenge found or challenge expired");
  }
  let verification;
  try {
    verification = await (0, _server.verifyRegistrationResponse)({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigin(ctx),
      expectedRPID: getRpID(ctx),
      // Match the "preferred" policy in registration options; some
      // authenticators legitimately skip user verification.
      requireUserVerification: false
    });
  } catch (error) {
    const err = (0, _error.toError)(error);
    _Logger.default.error("passkeys: Registration verification failed", err);
    throw (0, _errors.ValidationError)(err.message);
  }
  const {
    verified,
    registrationInfo
  } = verification;
  const ZERO_AAGUID = "00000000-0000-0000-0000-000000000000";
  if (verified && registrationInfo) {
    const {
      credential,
      aaguid
    } = registrationInfo;
    // credential.id is already a Base64URL string
    const credentialIdBase64 = credential.id;
    const credentialPublicKey = credential.publicKey;
    const counter = credential.counter;

    // Capture user agent and generate friendly name
    const userAgent = ctx.request.get("user-agent");
    const transports = body.response.transports || [];

    // Check if already exists by credential ID
    const existing = await _models.UserPasskey.findOne({
      where: {
        credentialId: credentialIdBase64
      }
    });
    if (existing) {
      if (existing.userId !== user.id) {
        throw (0, _errors.ValidationError)("Passkey already registered to another user");
      }
      await existing.updateWithCtx(ctx, {
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        userAgent,
        aaguid
      });
    } else {
      // Check if user already has a passkey from the same authenticator
      if (aaguid && aaguid !== ZERO_AAGUID) {
        const duplicateDevice = await _models.UserPasskey.findOne({
          where: {
            userId: user.id,
            aaguid
          }
        });
        if (duplicateDevice) {
          throw (0, _errors.ValidationError)("You already have a passkey on this device");
        }
      }
      await _models.UserPasskey.createWithCtx(ctx, {
        userId: user.id,
        credentialId: credentialIdBase64,
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        transports,
        name: (0, _passkeys.generatePasskeyName)(aaguid, userAgent, transports),
        userAgent,
        aaguid
      });
    }

    // Delete challenge from Redis
    await _redis.default.defaultClient.del(getRegistrationChallengeKey(user.id));
    ctx.body = {
      data: {
        verified: true
      }
    };
  } else {
    throw (0, _errors.ValidationError)("Verification failed");
  }
});

/**
 * Resolves the login screen redirect for the desktop passkey entrypoint,
 * normalizing an untrusted client query parameter to a known value.
 *
 * @param client - the raw client value from the request query.
 * @returns the relative path to redirect the browser to.
 */
const getPasskeyLoginRedirect = client => {
  const normalized = client === _types.Client.Desktop ? _types.Client.Desktop : _types.Client.Web;
  return `/?method=passkey&client=${normalized}`;
};

/**
 * Entry point for passkey login from the desktop app. The WebAuthn ceremony
 * cannot run inside Electron's Chromium, so the desktop client opens this URL
 * in the system browser. We forward to the login screen, which auto-starts the
 * ceremony and returns the authenticated session via the outline:// deep link,
 * mirroring the existing SSO desktop flow.
 */
exports.getPasskeyLoginRedirect = getPasskeyLoginRedirect;
router.get("passkey", ctx => {
  ctx.redirect(getPasskeyLoginRedirect(ctx.query.client));
});
router.post("passkeys.generateAuthenticationOptions", (0, _validate.default)(T.PasskeysGenerateAuthenticationOptionsSchema), async ctx => {
  const options = await (0, _server.generateAuthenticationOptions)({
    rpID: getRpID(ctx),
    userVerification: "preferred"
  });

  // Generate a unique challenge ID for this authentication attempt
  const challengeId = (0, _nodeCrypto.randomBytes)(32).toString("hex");
  await _redis.default.defaultClient.set(getAuthenticationChallengeKey(challengeId), options.challenge, "PX", CHALLENGE_EXPIRY_MS);
  ctx.body = {
    data: {
      ...options,
      challengeId
    }
  };
});
router.post("passkeys.verifyAuthentication", (0, _validate.default)(T.PasskeysVerifyAuthenticationSchema), async ctx => {
  const body = ctx.input.body;
  const {
    challengeId,
    client = _types.Client.Web
  } = body;

  // Retrieve challenge from Redis
  const expectedChallenge = await _redis.default.defaultClient.get(getAuthenticationChallengeKey(challengeId));
  if (!expectedChallenge) {
    throw (0, _errors.ValidationError)("No authentication challenge found or challenge expired");
  }
  const credentialId = body.id;
  const passkey = await _models.UserPasskey.findOne({
    where: {
      credentialId
    },
    include: [{
      model: _models.User,
      as: "user",
      include: [{
        model: _models.Team,
        as: "team",
        required: true
      }]
    }]
  });
  if (!passkey) {
    throw (0, _errors.ValidationError)("Passkey not found. It may have been removed or registered on a different account.");
  }
  const user = passkey.user;
  const team = user.team;
  if (!team.passkeysEnabled) {
    throw (0, _errors.AuthorizationError)("Passkey authentication is not enabled for this team");
  }
  let verification;
  try {
    verification = await (0, _server.verifyAuthenticationResponse)({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigin(ctx),
      expectedRPID: getRpID(ctx),
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports
      },
      // Match the "preferred" policy in authentication options; some
      // authenticators legitimately skip user verification.
      requireUserVerification: false
    });
  } catch (err) {
    _Logger.default.error("passkeys: Authentication verification failed", (0, _error.toError)(err));
    throw (0, _errors.ValidationError)("Passkey authentication failed. Please try again.");
  }
  const {
    verified,
    authenticationInfo
  } = verification;
  if (verified && authenticationInfo) {
    // Update counter
    passkey.counter = authenticationInfo.newCounter;
    passkey.lastActiveAt = new Date();
    await passkey.save({
      silent: true
    });

    // Delete challenge from Redis
    await _redis.default.defaultClient.del(getAuthenticationChallengeKey(challengeId));

    // Use the signIn utility which handles all sign-in logic
    await (0, _authentication2.signIn)(ctx, "passkeys", {
      user,
      team,
      isNewUser: false,
      isNewTeam: false,
      client
    });
  } else {
    throw (0, _errors.ValidationError)("Verification failed");
  }
});
var _default = exports.default = router;