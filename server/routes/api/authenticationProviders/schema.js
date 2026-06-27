"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationProvidersUpdateSchema = exports.AuthenticationProvidersInfoSchema = exports.AuthenticationProvidersDeleteSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
const AuthenticationProvidersInfoSchema = exports.AuthenticationProvidersInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Authentication Provider Id */
    id: _zod.z.uuid()
  })
});
/** Schema for group sync settings on an authentication provider. */
const AuthenticationProviderSettingsSchema = _zod.z.object({
  /** Whether group sync from this provider is enabled. */
  groupSyncEnabled: _zod.z.boolean().optional(),
  /** The claim path in the provider response that contains group data. */
  groupClaim: _zod.z.string().max(255).optional(),
  /** Additional scopes to request when group sync is enabled. */
  groupSyncScopes: _zod.z.array(_zod.z.string().max(255)).max(20).optional()
});
const AuthenticationProvidersUpdateSchema = exports.AuthenticationProvidersUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Authentication Provider Id */
    id: _zod.z.uuid(),
    /** Whether the Authentication Provider is enabled or not */
    isEnabled: _zod.z.boolean().optional(),
    /** Provider-specific settings such as group sync configuration */
    settings: AuthenticationProviderSettingsSchema.optional()
  })
});
const AuthenticationProvidersDeleteSchema = exports.AuthenticationProvidersDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Authentication Provider Id */
    id: _zod.z.uuid()
  })
});