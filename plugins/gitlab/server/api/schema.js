"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitLabConnectSchema = exports.GitLabCallbackSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _schema = require("../../../../server/routes/api/schema");
const GitLabCallbackSchema = exports.GitLabCallbackSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string().nullish(),
    state: _zod.z.string(),
    error: _zod.z.string().nullish()
  }).refine(req => !((0, _compat.isEmpty)(req.code) && (0, _compat.isEmpty)(req.error)), {
    message: "one of code or error is required"
  })
});
const GitLabConnectSchema = exports.GitLabConnectSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    url: _zod.z.url().startsWith("https://").optional(),
    clientId: _zod.z.string().optional(),
    clientSecret: _zod.z.string().optional()
  }).refine(data => {
    const {
      url,
      clientId,
      clientSecret
    } = data;
    const allOrNone = url && clientId && clientSecret || !url && !clientId && !clientSecret;
    return allOrNone;
  }, {
    message: "Either all of url, clientId, and clientSecret must be provided, or none of them."
  })
});