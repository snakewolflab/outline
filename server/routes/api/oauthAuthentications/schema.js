"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuthAuthenticationsListSchema = exports.OAuthAuthenticationsDeleteSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
const OAuthAuthenticationsListSchema = exports.OAuthAuthenticationsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({})
});
const OAuthAuthenticationsDeleteSchema = exports.OAuthAuthenticationsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    oauthClientId: _zod.z.string().uuid(),
    scope: _zod.z.array(_zod.z.string()).optional()
  })
});