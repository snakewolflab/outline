"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = apiErrorHandler;
var _sequelize = require("sequelize");
var _errors = require("../../../errors");
function apiErrorHandler() {
  return async function apiErrorHandlerMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      let transformedErr = err;
      if (!(err instanceof _errors.AuthorizationError) && err instanceof Error && /Authorization error/i.test(err.message)) {
        transformedErr = (0, _errors.AuthorizationError)();
      }
      if (err instanceof _sequelize.ValidationError) {
        if (err.errors && err.errors[0]) {
          transformedErr = (0, _errors.ValidationError)(`${err.errors[0].message} (${err.errors[0].path})`);
        } else {
          transformedErr = (0, _errors.ValidationError)();
        }
      }
      if (err instanceof Error && "code" in err && err.code === "ENOENT" || err instanceof _sequelize.EmptyResultError || err instanceof Error && /Not found/i.test(err.message)) {
        transformedErr = (0, _errors.NotFoundError)();
      }
      throw transformedErr;
    }
  };
}