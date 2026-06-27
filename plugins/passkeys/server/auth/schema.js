"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasskeysVerifyRegistrationSchema = exports.PasskeysVerifyAuthenticationSchema = exports.PasskeysGenerateAuthenticationOptionsSchema = void 0;
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../../../../server/routes/api/schema");
const PasskeysGenerateAuthenticationOptionsSchema = exports.PasskeysGenerateAuthenticationOptionsSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({}),
  query: _zod.z.object({
    client: _zod.z.enum(_types.Client).optional()
  })
});
const PasskeysVerifyAuthenticationSchema = exports.PasskeysVerifyAuthenticationSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    challengeId: _zod.z.string(),
    client: _zod.z.enum(_types.Client).optional(),
    id: _zod.z.string(),
    rawId: _zod.z.string(),
    response: _zod.z.object({
      authenticatorData: _zod.z.string(),
      clientDataJSON: _zod.z.string(),
      signature: _zod.z.string(),
      userHandle: _zod.z.string().optional()
    }),
    type: _zod.z.literal("public-key"),
    authenticatorAttachment: _zod.z.enum(["cross-platform", "platform"]).optional(),
    clientExtensionResults: _zod.z.object({
      appid: _zod.z.boolean().optional(),
      hmacCreateSecret: _zod.z.boolean().optional()
    }).prefault({})
  })
});
const PasskeysVerifyRegistrationSchema = exports.PasskeysVerifyRegistrationSchema = _schema.BaseSchema.extend({
  body: _zod.z.any() // WebAuthn RegistrationResponseJSON from @simplewebauthn/browser
});