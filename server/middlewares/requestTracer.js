"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requestTracer;
var _tracer = require("../logging/tracer");
function requestTracer() {
  return async function requestTracerMiddleware(ctx, next) {
    const params = ctx.request.body ?? ctx.request.query;
    for (const key in params) {
      if (key === "id" || key.endsWith("Id")) {
        const value = params[key];
        if (typeof value === "string") {
          (0, _tracer.addTags)({
            [`resource.${key}`]: value
          }, (0, _tracer.getRootSpanFromRequestContext)(ctx));
        }
      }
    }
    await next();
  };
}