"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultRateLimiter = defaultRateLimiter;
exports.rateLimiter = rateLimiter;
var _compat = require("es-toolkit/compat");
var _rateLimiterFlexible = require("rate-limiter-flexible");
var _error = require("../../shared/utils/error");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _Metrics = _interopRequireDefault(require("../logging/Metrics"));
var _models = require("../models");
var _redis = _interopRequireDefault(require("../storage/redis"));
var _jwt = require("../utils/jwt");
var _RateLimiter = _interopRequireDefault(require("../utils/RateLimiter"));
var _authentication = require("./authentication");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Returns a unique identifier for rate limiting based on the request context.
 * Keys on the user id (so users behind a shared NAT don't share a bucket) when
 * a token can be associated with a user, otherwise falls back to the client's
 * IP address.
 *
 * @param ctx The application context.
 * @returns A string identifier for rate limiting.
 */
async function getRateLimiterIdentifier(ctx) {
  try {
    const {
      token
    } = (0, _authentication.parseAuthentication)(ctx);
    if (!token) {
      return ctx.ip;
    }
    if (_models.ApiKey.match(token) || _models.OAuthAuthentication.match(token)) {
      return ctx.ip;
    }
    let userId = await _RateLimiter.default.getCachedUserIdForToken(token);
    if (!userId) {
      const {
        user
      } = await (0, _jwt.getUserForJWT)(token);
      userId = user.id;
      void _RateLimiter.default.cacheUserForToken(token, userId);
    }
    return userId;
  } catch {
    // Fall through to IP-based rate limiting
  }
  return ctx.ip;
}

/**
 * Middleware that limits the number of requests that are allowed within a given
 * window. Should only be applied once to a server – do not use on individual
 * routes.
 *
 * @returns The middleware function.
 */
function defaultRateLimiter() {
  return async function rateLimiterMiddleware(ctx, next) {
    if (!_env.default.RATE_LIMITER_ENABLED) {
      return next();
    }
    const fullPath = `${ctx.mountPath ?? ""}${ctx.path}`;
    const identifier = await getRateLimiterIdentifier(ctx);
    const key = _RateLimiter.default.hasRateLimiter(fullPath) ? `${fullPath}:${identifier}` : identifier;
    const limiter = _RateLimiter.default.getRateLimiter(fullPath);
    try {
      await limiter.consume(key);
    } catch (rateLimiterRes) {
      if (rateLimiterRes instanceof Error || !(rateLimiterRes instanceof _rateLimiterFlexible.RateLimiterRes)) {
        _Logger.default.error("Rate limiter error", (0, _error.toError)(rateLimiterRes));
        return next();
      }
      ctx.set("Retry-After", `${rateLimiterRes.msBeforeNext / 1000}`);
      ctx.set("RateLimit-Limit", `${limiter.points}`);
      ctx.set("RateLimit-Remaining", `${rateLimiterRes.remainingPoints}`);
      ctx.set("RateLimit-Reset", new Date(Date.now() + rateLimiterRes.msBeforeNext).toString());
      _Metrics.default.increment("rate_limit.exceeded", {
        path: fullPath
      });
      throw (0, _errors.RateLimitExceededError)();
    }
    return next();
  };
}
/**
 * Middleware that limits the number of requests that are allowed within a
 * window, overrides default middleware when used on a route. Uses user ID for
 * authenticated requests and IP address otherwise.
 *
 * @returns The middleware function.
 */
function rateLimiter(config) {
  return async function registerRateLimiterMiddleware(ctx, next) {
    if (!_env.default.RATE_LIMITER_ENABLED) {
      return next();
    }
    const fullPath = `${ctx.mountPath ?? ""}${ctx.path}`;
    if (!_RateLimiter.default.hasRateLimiter(fullPath)) {
      const points = Math.max(1, Math.round(config.requests * _env.default.RATE_LIMITER_MULTIPLIER));
      _RateLimiter.default.setRateLimiter(fullPath, (0, _compat.defaults)({
        ...config,
        points
      }, {
        duration: 60,
        points: _env.default.RATE_LIMITER_REQUESTS,
        keyPrefix: _RateLimiter.default.RATE_LIMITER_REDIS_KEY_PREFIX,
        storeClient: _redis.default.defaultClient
      }));
    }
    return next();
  };
}