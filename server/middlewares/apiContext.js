"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiContext = apiContext;
/**
 * Middleware that defines the `ctx.context` getter, which provides the current
 * request's auth, transaction, and IP to database mutation helpers like
 * `saveWithCtx` and `destroyWithCtx`.
 *
 * @returns The middleware function.
 */
function apiContext() {
  return async function apiContextMiddleware(ctx, next) {
    Object.defineProperty(ctx, "context", {
      configurable: true,
      get() {
        return {
          auth: ctx.state.auth,
          transaction: ctx.state.transaction,
          ip: ctx.request.ip
        };
      }
    });
    return next();
  };
}