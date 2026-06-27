"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuthClientsUpdateSchema = exports.OAuthClientsRotateSecretSchema = exports.OAuthClientsListSchema = exports.OAuthClientsInfoSchema = exports.OAuthClientsDeleteSchema = exports.OAuthClientsCreateSchema = void 0;
var _zod = require("zod");
var _validations = require("../../../../shared/validations");
var _schema = require("../schema");
const OAuthClientsInfoSchema = exports.OAuthClientsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** OAuth client id */
    id: _zod.z.uuid().optional(),
    /** OAuth clientId */
    clientId: _zod.z.string().optional(),
    redirectUri: _zod.z.string().optional()
  }).refine(data => data.id || data.clientId, {
    error: "Either id or clientId is required"
  })
});
const OAuthClientsCreateSchema = exports.OAuthClientsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** OAuth client type */
    clientType: _zod.z.enum(_validations.OAuthClientValidation.clientTypes).prefault("confidential"),
    /** OAuth client name */
    name: _zod.z.string(),
    /** OAuth client description */
    description: _zod.z.string().nullish(),
    /** OAuth client developer name */
    developerName: _zod.z.string().nullish(),
    /** OAuth client developer url */
    developerUrl: _zod.z.string().nullish(),
    /** OAuth client avatar url */
    avatarUrl: _zod.z.string().nullish(),
    /** OAuth client redirect uri */
    redirectUris: _zod.z.array(_zod.z.url()).min(1, {
      error: "At least one redirect uri is required"
    }).max(10, {
      error: "A maximum of 10 redirect uris are allowed"
    }).refine(uris => uris.every(uri => uri.length <= _validations.OAuthClientValidation.maxRedirectUriLength), {
      message: `Redirect uri must be less than ${_validations.OAuthClientValidation.maxRedirectUriLength} characters`
    }),
    /** OAuth client published */
    published: _zod.z.boolean().prefault(false)
  })
});
const OAuthClientsUpdateSchema = exports.OAuthClientsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    /** OAuth client type */
    clientType: _zod.z.enum(_validations.OAuthClientValidation.clientTypes).optional(),
    /** OAuth client name */
    name: _zod.z.string().optional(),
    /** OAuth client description */
    description: _zod.z.string().nullish(),
    /** OAuth client developer name */
    developerName: _zod.z.string().nullish(),
    /** OAuth client developer url */
    developerUrl: _zod.z.string().nullish(),
    /** OAuth client avatar url */
    avatarUrl: _zod.z.string().nullish(),
    /** OAuth client redirect uri */
    redirectUris: _zod.z.array(_zod.z.url()).min(1, {
      error: "At least one redirect uri is required"
    }).max(10, {
      error: "A maximum of 10 redirect uris are allowed"
    }).refine(uris => uris.every(uri => uri.length <= _validations.OAuthClientValidation.maxRedirectUriLength), {
      message: `Redirect uri must be less than ${_validations.OAuthClientValidation.maxRedirectUriLength} characters`
    }).optional(),
    /** OAuth client published */
    published: _zod.z.boolean().optional()
  })
});
const OAuthClientsDeleteSchema = exports.OAuthClientsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** OAuth client id */
    id: _zod.z.uuid()
  })
});
const OAuthClientsRotateSecretSchema = exports.OAuthClientsRotateSecretSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** OAuth client id */
    id: _zod.z.uuid()
  })
});
const OAuthClientsListSchema = exports.OAuthClientsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({})
});