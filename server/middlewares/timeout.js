"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = timeout;
/**
 * Middleware to extend the request timeout for specific routes.
 *
 * @param timeoutMs The timeout in milliseconds.
 * @returns The middleware function.
 */
function timeout(timeoutMs) {
  return async function timeoutMiddleware(ctx, next) {
    // Store the original timeout so we can restore it later
    const originalTimeout = ctx.req.socket.timeout || 0;

    // Set the new timeout on the socket
    ctx.req.socket.setTimeout(timeoutMs);
    try {
      await next();
    } finally {
      // Restore the original timeout after the request completes
      ctx.req.socket.setTimeout(originalTimeout);
    }
  };
}