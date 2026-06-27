"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachCSRFToken = attachCSRFToken;
exports.verifyCSRFToken = verifyCSRFToken;
var _types = require("../../shared/types");
var _env = _interopRequireDefault(require("../env"));
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _csrf = require("../utils/csrf");
var _domains = require("../../shared/utils/domains");
var _constants = require("../../shared/constants");
var _errors = require("../errors");
var _authentication = require("./authentication");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Middleware that generates and attaches CSRF tokens for safe methods
 */
function attachCSRFToken() {
  return async function attachCSRFTokenMiddleware(ctx, next) {
    // Only attach tokens for safe methods that don't mutate state
    if (["GET", "HEAD", "OPTIONS"].includes(ctx.method)) {
      const raw = (0, _csrf.generateRawToken)(16);
      const bundled = (0, _csrf.bundleToken)(raw, _env.default.SECRET_KEY);

      // Set cookie that JavaScript can read (not HttpOnly)
      ctx.cookies.set(_constants.CSRF.cookieName, bundled, {
        httpOnly: false,
        sameSite: "lax",
        domain: (0, _domains.getCookieDomain)(ctx.request.hostname, _env.default.isCloudHosted)
      });
    }
    await next();
  };
}

/**
 * Middleware that verifies CSRF tokens for mutating requests
 */
function verifyCSRFToken() {
  /**
   * Determines if a request requires CSRF protection
   */
  const shouldProtectRequest = ctx => {
    // Skip if not a potentially mutating method
    if (["GET", "HEAD", "OPTIONS"].includes(ctx.method)) {
      return false;
    }

    // If not using cookie-based auth, skip CSRF protection
    const {
      transport
    } = (0, _authentication.parseAuthentication)(ctx);
    if (transport !== "cookie") {
      return false;
    }

    // For API routes, use AuthenticationHelper to determine if the operation is read-only
    if (ctx.originalUrl.startsWith("/api/")) {
      const canAccessWithReadOnly = _AuthenticationHelper.default.canAccess(ctx.path, [_types.Scope.Read]);

      // If it can be accessed with read-only scope, it doesn't need CSRF protection
      if (canAccessWithReadOnly) {
        return false;
      }
    }

    // Protect all other mutating requests
    return true;
  };
  return async function verifyCSRFTokenMiddleware(ctx, next) {
    if (!shouldProtectRequest(ctx)) {
      await next();
      return;
    }

    // Get token from cookie
    const cookieVal = ctx.cookies.get(_constants.CSRF.cookieName);
    if (!cookieVal) {
      throw (0, _errors.CSRFError)("CSRF token missing from cookie");
    }

    // Get token from header or form field depending on type
    // Access the already-parsed body from koa-body middleware
    const inputVal = ctx.get(_constants.CSRF.headerName) || ctx.request.body?.[_constants.CSRF.fieldName];
    if (!inputVal) {
      throw (0, _errors.CSRFError)("CSRF token missing from request");
    }

    // Verify both tokens are valid HMAC-signed tokens
    const {
      valid: cookieValid
    } = (0, _csrf.unbundleToken)(cookieVal, _env.default.SECRET_KEY);
    const {
      valid: inputValid
    } = (0, _csrf.unbundleToken)(inputVal, _env.default.SECRET_KEY);
    if (!cookieValid || !inputValid) {
      throw (0, _errors.CSRFError)("CSRF token invalid or malformed");
    }

    // Verify tokens match (double-submit check)
    if (cookieVal !== inputVal) {
      throw (0, _errors.CSRFError)("CSRF token mismatch");
    }
    await next();
  };
}