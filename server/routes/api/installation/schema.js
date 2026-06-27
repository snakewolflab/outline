"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InstallationCreateSchema = void 0;
var _zod = require("zod");
var _validations = require("../../../../shared/validations");
var _schema = require("../schema");
const InstallationCreateSchema = exports.InstallationCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Team name */
    teamName: _zod.z.string().min(1).max(_validations.TeamValidation.maxNameLength),
    /** User name */
    userName: _zod.z.string().min(1).max(_validations.UserValidation.maxNameLength),
    /** User email */
    userEmail: _zod.z.email().max(_validations.UserValidation.maxEmailLength)
  })
});