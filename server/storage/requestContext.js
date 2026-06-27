"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestContext = void 0;
var _nodeAsync_hooks = require("node:async_hooks");
/**
 * Async local storage for the current HTTP request context. This allows
 * downstream code (e.g. Sequelize hooks) to check whether the originating
 * request is still alive without explicitly threading `ctx` through every call.
 */
const requestContext = exports.requestContext = new _nodeAsync_hooks.AsyncLocalStorage();