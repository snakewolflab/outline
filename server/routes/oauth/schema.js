"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenSchema = exports.TokenRevokeSchema = exports.RegisterUpdateSchema = exports.RegisterSchema = void 0;
var _zod = _interopRequireDefault(require("zod"));
var _validations = require("../../../shared/validations");
var _schema = require("../api/schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const TokenSchema = exports.TokenSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    grant_type: _zod.default.string(),
    code: _zod.default.string().optional(),
    redirect_uri: _zod.default.string().optional(),
    client_id: _zod.default.string().optional(),
    client_secret: _zod.default.string().optional(),
    refresh_token: _zod.default.string().optional(),
    scope: _zod.default.string().optional()
  })
});
const TokenRevokeSchema = exports.TokenRevokeSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    token: _zod.default.string(),
    token_type_hint: _zod.default.string().optional()
  })
});
const RegisterSchema = exports.RegisterSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    // RFC 7591 §2 marks every metadata field as OPTIONAL; some MCP clients
    // omit `client_name` on dynamic registration and currently get rejected.
    // A default is filled in by the handler when the field is absent.
    client_name: _zod.default.string().min(1).max(_validations.OAuthClientValidation.maxNameLength).optional(),
    redirect_uris: _zod.default.array(_zod.default.url().max(_validations.OAuthClientValidation.maxRedirectUriLength)).min(1).max(10),
    grant_types: _zod.default.array(_zod.default.enum(["authorization_code", "refresh_token"])).default(["authorization_code"]),
    response_types: _zod.default.array(_zod.default.enum(["code"])).default(["code"]),
    token_endpoint_auth_method: _zod.default.enum(["none", "client_secret_post"]).default("none"),
    scope: _zod.default.string().optional(),
    client_uri: _zod.default.string().url().max(_validations.OAuthClientValidation.maxDeveloperUrlLength).optional(),
    logo_uri: _zod.default.string().url().max(_validations.OAuthClientValidation.maxAvatarUrlLength).optional(),
    contacts: _zod.default.array(_zod.default.string().email()).optional()
  })
});
const RegisterUpdateSchema = exports.RegisterUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    client_name: _zod.default.string().min(1).max(_validations.OAuthClientValidation.maxNameLength),
    redirect_uris: _zod.default.array(_zod.default.url().max(_validations.OAuthClientValidation.maxRedirectUriLength)).min(1).max(10),
    client_uri: _zod.default.string().url().max(_validations.OAuthClientValidation.maxDeveloperUrlLength).optional(),
    logo_uri: _zod.default.string().url().max(_validations.OAuthClientValidation.maxAvatarUrlLength).optional()
  })
});