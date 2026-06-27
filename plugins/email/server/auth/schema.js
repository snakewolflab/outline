"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmailSchema = exports.EmailCallbackSchema = void 0;
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../../../../server/routes/api/schema");
const EmailSchema = exports.EmailSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    email: _zod.z.email(),
    client: _zod.z.enum(_types.Client).prefault(_types.Client.Web),
    preferOTP: _zod.z.boolean().prefault(false)
  })
});
const callbackDataSchema = _zod.z.object({
  token: _zod.z.string().optional(),
  code: _zod.z.string().optional(),
  email: _zod.z.email().optional(),
  client: _zod.z.enum(_types.Client).optional(),
  follow: _zod.z.string().prefault("")
}).refine(data => !(data.code && !data.email) && !(data.email && !data.code && !data.token), {
  error: "Both code and email must be provided together"
});
const EmailCallbackSchema = exports.EmailCallbackSchema = _schema.BaseSchema.extend({
  query: callbackDataSchema,
  body: callbackDataSchema
});