"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasskeysUpdateSchema = exports.PasskeysListSchema = exports.PasskeysDeleteSchema = void 0;
var _zod = require("zod");
var _schema = require("../../../../server/routes/api/schema");
var _validations = require("../../../../shared/validations");
const PasskeysListSchema = exports.PasskeysListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({})
});
const PasskeysDeleteSchema = exports.PasskeysDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});
const PasskeysUpdateSchema = exports.PasskeysUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    name: _zod.z.string().trim().min(_validations.UserPasskeyValidation.minNameLength).max(_validations.UserPasskeyValidation.maxNameLength)
  })
});