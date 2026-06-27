"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.APIKeysListSchema = exports.APIKeysDeleteSchema = exports.APIKeysCreateSchema = void 0;
var _zod = require("zod");
var _models = require("../../../models");
var _schema = require("../schema");
var _validations = require("../../../../shared/validations");
const APIKeysCreateSchema = exports.APIKeysCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** API Key name */
    name: _zod.z.string().trim().min(_validations.ApiKeyValidation.minNameLength).max(_validations.ApiKeyValidation.maxNameLength),
    /** API Key expiry date */
    expiresAt: _zod.z.coerce.date().optional(),
    /** A list of scopes that this API key has access to */
    scope: _zod.z.array(_zod.z.string()).optional()
  })
});
const APIKeysListSchema = exports.APIKeysListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** The owner of the API key */
    userId: _zod.z.uuid().optional(),
    /** Search query to filter API keys by name */
    query: _zod.z.string().optional(),
    /** API keys sorting direction */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    /** API keys sorting column */
    sort: _zod.z.string().refine(val => Object.keys(_models.ApiKey.getAttributes()).includes(val), {
      error: "Invalid sort parameter"
    }).prefault("createdAt")
  })
});
const APIKeysDeleteSchema = exports.APIKeysDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** API Key Id */
    id: _zod.z.uuid()
  })
});