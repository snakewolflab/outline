"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.server = void 0;
var _msw = require("msw");
var _node = require("msw/node");
// Pass-through handlers for in-process supertest requests. Registered as
// initial handlers so they survive server.resetHandlers() between tests.
const passthroughLocalhost = _msw.http.all(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/, () => (0, _msw.passthrough)());
const server = exports.server = (0, _node.setupServer)(passthroughLocalhost);