"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requestContextMiddleware;
var _requestContext = require("../storage/requestContext");
/**
 * Middleware that wraps the request in an AsyncLocalStorage context, making the
 * current request available to Sequelize hooks so that queries can be
 * short-circuited when the socket has been destroyed (e.g. after a timeout).
 *
 * @returns The middleware function.
 */
function requestContextMiddleware() {
  return (ctx, next) => _requestContext.requestContext.run({
    req: ctx.req
  }, next);
}