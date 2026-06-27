"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hashOAuthStateNonce = hashOAuthStateNonce;
exports.signOAuthIntent = signOAuthIntent;
exports.signOAuthState = signOAuthState;
exports.verifyOAuthIntent = verifyOAuthIntent;
exports.verifyOAuthState = verifyOAuthState;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _types = require("../../shared/types");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _crypto = require("./crypto");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Algorithm = "HS256";
const ExpiresInSeconds = 10 * 60;
const IntentType = "oauth_intent";
const StateType = "oauth_state";
/**
 * Hashes an OAuth CSRF nonce for storage in signed OAuth state.
 *
 * @param nonce the nonce stored in the browser cookie.
 * @returns the sha256 hash of the nonce.
 */
function hashOAuthStateNonce(nonce) {
  return (0, _crypto.hash)(nonce);
}

/**
 * Creates a short-lived signed OAuth intent token.
 *
 * @param payload the intent values to sign.
 * @returns the signed intent token.
 */
function signOAuthIntent(payload) {
  return sign({
    ...payload,
    type: IntentType
  });
}

/**
 * Verifies a signed OAuth intent token.
 *
 * @param token the token to verify.
 * @returns the verified intent payload.
 * @throws {OAuthStateMismatchError} if the token is missing, expired, invalid,
 * or has an unexpected payload shape.
 */
function verifyOAuthIntent(token) {
  const payload = verify(token);
  if (!isOAuthIntent(payload)) {
    throw (0, _errors.OAuthStateMismatchError)("Invalid OAuth intent");
  }
  return payload;
}

/**
 * Creates a short-lived signed OAuth state token.
 *
 * @param payload the OAuth state values to sign.
 * @returns the signed OAuth state token.
 */
function signOAuthState(payload) {
  return sign({
    ...payload,
    type: StateType
  });
}

/**
 * Verifies a signed OAuth state token.
 *
 * @param token the token to verify.
 * @returns the verified OAuth state payload.
 * @throws {OAuthStateMismatchError} if the token is missing, expired, invalid,
 * or has an unexpected payload shape.
 */
function verifyOAuthState(token) {
  const payload = verify(token);
  if (!isOAuthState(payload)) {
    throw (0, _errors.OAuthStateMismatchError)("Invalid OAuth state");
  }
  return payload;
}
function sign(payload) {
  return _jsonwebtoken.default.sign(payload, _env.default.SECRET_KEY, {
    algorithm: Algorithm,
    expiresIn: ExpiresInSeconds
  });
}
function verify(token) {
  try {
    const payload = _jsonwebtoken.default.verify(token, _env.default.SECRET_KEY, {
      algorithms: [Algorithm]
    });
    if (typeof payload === "string") {
      throw (0, _errors.OAuthStateMismatchError)("Invalid OAuth state");
    }
    return payload;
  } catch (err) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      throw (0, _errors.OAuthStateMismatchError)("Expired OAuth state");
    }
    throw (0, _errors.OAuthStateMismatchError)("Invalid OAuth state");
  }
}
function isOAuthIntent(payload) {
  return payload.type === IntentType && typeof payload.host === "string" && isClient(payload.client) && isOptionalString(payload.actorId) && isOptionalString(payload.actorSessionHash) && payload.nonceHash === undefined && payload.codeVerifier === undefined && typeof payload.iat === "number" && typeof payload.exp === "number";
}
function isOAuthState(payload) {
  return payload.type === StateType && typeof payload.host === "string" && isClient(payload.client) && isOptionalString(payload.actorId) && isOptionalString(payload.actorSessionHash) && typeof payload.iat === "number" && typeof payload.exp === "number" && typeof payload.nonceHash === "string" && isOptionalString(payload.codeVerifier);
}
function isClient(value) {
  return value === _types.Client.Desktop || value === _types.Client.Web;
}
function isOptionalString(value) {
  return value === undefined || typeof value === "string";
}