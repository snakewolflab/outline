"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RateLimiterStrategy = void 0;
var _crypto = require("crypto");
var _rateLimiterFlexible = require("rate-limiter-flexible");
var _error = require("../../shared/utils/error");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _redis = _interopRequireDefault(require("../storage/redis"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class RateLimiter {
  constructor() {
    throw Error(`Cannot instantiate class!`);
  }
  static get defaultRateLimiter() {
    if (!this._defaultRateLimiter) {
      this._defaultRateLimiter = new _rateLimiterFlexible.RateLimiterRedis({
        storeClient: _redis.default.defaultClient,
        points: _env.default.RATE_LIMITER_REQUESTS,
        duration: _env.default.RATE_LIMITER_DURATION_WINDOW,
        keyPrefix: this.RATE_LIMITER_REDIS_KEY_PREFIX,
        insuranceLimiter: this.insuranceRateLimiter
      });
    }
    return this._defaultRateLimiter;
  }
  static getRateLimiter(path) {
    return this.rateLimiterMap.get(path) || this.defaultRateLimiter;
  }
  static setRateLimiter(path, config) {
    const rateLimiter = new _rateLimiterFlexible.RateLimiterRedis(config);
    this.rateLimiterMap.set(path, rateLimiter);
  }
  static hasRateLimiter(path) {
    return this.rateLimiterMap.has(path);
  }

  /**
   * Caches the user id associated with a verified authentication token so that
   * subsequent requests can be keyed by user without re-validating the token.
   * Errors are swallowed — a failed cache write just means the next request
   * falls back to IP-based keying.
   *
   * @param token The authentication token that was just verified.
   * @param userId The id of the user the token belongs to.
   */
  static async cacheUserForToken(token, userId) {
    try {
      await _redis.default.defaultClient.set(this.tokenCacheKey(token), userId, "EX", this.TOKEN_CACHE_TTL_SECONDS);
    } catch (err) {
      _Logger.default.warn("Failed to cache user for rate limiter token", (0, _error.toError)(err));
    }
  }

  /**
   * Looks up the cached user id for a previously verified token. Returns null
   * on cache miss or Redis error.
   *
   * @param token The authentication token presented on the current request.
   * @returns The associated user id, or null if unknown.
   */
  static async getCachedUserIdForToken(token) {
    try {
      return await _redis.default.defaultClient.get(this.tokenCacheKey(token));
    } catch (err) {
      _Logger.default.warn("Failed to read cached user for rate limiter token", (0, _error.toError)(err));
      return null;
    }
  }

  /**
   * Removes the cached user id for a token, for example on logout so that a
   * revoked token immediately stops keying rate limits per user.
   *
   * @param token The authentication token being invalidated.
   */
  static async clearCachedToken(token) {
    try {
      await _redis.default.defaultClient.del(this.tokenCacheKey(token));
    } catch (err) {
      _Logger.default.warn("Failed to clear cached rate limiter token", (0, _error.toError)(err));
    }
  }
  static tokenCacheKey(token) {
    const hash = (0, _crypto.createHash)("sha256").update(token).digest("hex");
    return `${this.TOKEN_CACHE_KEY_PREFIX}${hash}`;
  }
}

/**
 * Re-useable configuration for rate limiter middleware.
 */
exports.default = RateLimiter;
_defineProperty(RateLimiter, "RATE_LIMITER_REDIS_KEY_PREFIX", "rl");
_defineProperty(RateLimiter, "TOKEN_CACHE_KEY_PREFIX", "rl:tok:");
_defineProperty(RateLimiter, "TOKEN_CACHE_TTL_SECONDS", 3600);
_defineProperty(RateLimiter, "rateLimiterMap", new Map());
_defineProperty(RateLimiter, "insuranceRateLimiter", new _rateLimiterFlexible.RateLimiterMemory({
  points: _env.default.RATE_LIMITER_REQUESTS,
  duration: _env.default.RATE_LIMITER_DURATION_WINDOW
}));
_defineProperty(RateLimiter, "_defaultRateLimiter", void 0);
const RateLimiterStrategy = exports.RateLimiterStrategy = {
  /** Allows five requests per minute, per IP address */
  FivePerMinute: {
    duration: 60,
    requests: 5
  },
  /** Allows ten requests per minute, per IP address */
  TenPerMinute: {
    duration: 60,
    requests: 10
  },
  /** Allows twenty five requests per minute, per IP address */
  TwentyFivePerMinute: {
    duration: 60,
    requests: 25
  },
  /** Allows one hundred requests per minute, per IP address */
  OneHundredPerMinute: {
    duration: 60,
    requests: 100
  },
  /** Allows one thousand requests per hour, per IP address */
  OneThousandPerHour: {
    duration: 3600,
    requests: 1000
  },
  /** Allows one hunred requests per hour, per IP address */
  OneHundredPerHour: {
    duration: 3600,
    requests: 100
  },
  /** Allows fifty requests per hour, per IP address */
  FiftyPerHour: {
    duration: 3600,
    requests: 50
  },
  /** Allows ten requests per hour, per IP address */
  TenPerHour: {
    duration: 3600,
    requests: 10
  },
  /** Allows five requests per hour, per IP address */
  FivePerHour: {
    duration: 3600,
    requests: 5
  }
};