"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.generateOAuthStateNonce = generateOAuthStateNonce;
exports.verifyOAuthStateNonce = verifyOAuthStateNonce;
var _dateFns = require("date-fns");
var _error = require("../../shared/utils/error");
var _random = require("../../shared/random");
var _domains = require("../../shared/utils/domains");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _errors = require("../errors");
var _crypto = require("./crypto");
var _fetch = _interopRequireDefault(require("./fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Generate a random nonce, persist it in a same-origin cookie, and return it
 * for embedding in the `state` parameter of an outbound OAuth flow that is
 * initiated server-side. The matching callback handler must read the same
 * cookie via {@link verifyOAuthStateNonce}.
 *
 * @param ctx The Koa context for the request initiating the OAuth flow.
 * @param cookieName The cookie used to persist the nonce, unique per provider.
 * @returns The generated nonce.
 */
function generateOAuthStateNonce(ctx, cookieName) {
  const nonce = (0, _random.randomString)(32);
  ctx.cookies.set(cookieName, nonce, {
    httpOnly: true,
    sameSite: "lax",
    expires: (0, _dateFns.addMinutes)(new Date(), 10),
    domain: (0, _domains.getCookieDomain)(ctx.hostname, _env.default.isCloudHosted)
  });
  return nonce;
}

/**
 * Read a one-time OAuth nonce cookie, clear it, and timing-safe-compare it
 * against the nonce carried in the OAuth `state`. Throws when missing or
 * mismatched, providing CSRF protection for OAuth callbacks that perform
 * account-linking actions.
 *
 * @param ctx The Koa context for the callback request.
 * @param cookieName The cookie used to persist the nonce, unique per provider.
 * @param stateNonce The nonce extracted from the parsed OAuth state.
 * @throws {OAuthStateMismatchError} When the cookie is missing or does not
 *   match the supplied nonce.
 */
function verifyOAuthStateNonce(ctx, cookieName, stateNonce) {
  const cookieNonce = ctx.cookies.get(cookieName);
  ctx.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    expires: (0, _dateFns.subMinutes)(new Date(), 1),
    domain: (0, _domains.getCookieDomain)(ctx.hostname, _env.default.isCloudHosted)
  });
  if (!(0, _crypto.safeEqual)(cookieNonce, stateNonce)) {
    throw (0, _errors.OAuthStateMismatchError)();
  }
}
class OAuthClient {
  constructor(clientId, clientSecret) {
    _defineProperty(this, "clientId", void 0);
    _defineProperty(this, "clientSecret", void 0);
    _defineProperty(this, "endpoints", {
      authorize: "",
      token: "",
      userinfo: ""
    });
    _defineProperty(this, "userInfo", async accessToken => {
      let data;
      let response;
      try {
        response = await (0, _fetch.default)(this.endpoints.userinfo, {
          method: "GET",
          allowPrivateIPAddress: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
      } catch (err) {
        throw (0, _errors.InvalidRequestError)((0, _error.errToString)(err));
      }
      const success = response.status >= 200 && response.status < 300;
      if (!success) {
        throw (0, _errors.AuthenticationError)();
      }
      try {
        data = await response.json();
      } catch (err) {
        throw (0, _errors.InvalidRequestError)((0, _error.errToString)(err));
      }
      return data;
    });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }
  async rotateToken(_accessToken, refreshToken) {
    let endpoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.endpoints.token;
    let data;
    let response;
    try {
      _Logger.default.debug("utils", "Rotating token", {
        endpoint
      });
      response = await (0, _fetch.default)(endpoint, {
        method: "POST",
        allowPrivateIPAddress: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token"
        })
      });
      data = await response.json();
    } catch (err) {
      throw (0, _errors.InvalidRequestError)((0, _error.errToString)(err));
    }
    const success = response.status >= 200 && response.status < 300;
    if (!success) {
      throw (0, _errors.AuthenticationError)();
    }
    return {
      refreshToken: data.refresh_token,
      accessToken: data.access_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
    };
  }
}
exports.default = OAuthClient;