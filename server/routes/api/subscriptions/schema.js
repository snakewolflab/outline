"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubscriptionsListSchema = exports.SubscriptionsInfoSchema = exports.SubscriptionsDeleteTokenSchema = exports.SubscriptionsDeleteSchema = exports.SubscriptionsCreateSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _validation = require("../../../validation");
var _schema = require("../schema");
const SubscriptionBody = _zod.z.object({
  event: _zod.z.literal(_types.SubscriptionType.Document),
  collectionId: _zod.z.uuid().optional(),
  documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
    message: _validation.ValidateDocumentId.message
  }).optional()
}).refine(obj => !((0, _compat.isEmpty)(obj.collectionId) && (0, _compat.isEmpty)(obj.documentId)), {
  error: "one of collectionId or documentId is required"
}).refine(obj => !(!(0, _compat.isEmpty)(obj.collectionId) && !(0, _compat.isEmpty)(obj.documentId)), {
  error: "only one of collectionId or documentId may be provided"
});
const SubscriptionsListSchema = exports.SubscriptionsListSchema = _schema.BaseSchema.extend({
  body: SubscriptionBody
});
const SubscriptionsInfoSchema = exports.SubscriptionsInfoSchema = _schema.BaseSchema.extend({
  body: SubscriptionBody
});
const SubscriptionsCreateSchema = exports.SubscriptionsCreateSchema = _schema.BaseSchema.extend({
  body: SubscriptionBody
});
const SubscriptionsDeleteSchema = exports.SubscriptionsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});
const SubscriptionsDeleteTokenSchema = exports.SubscriptionsDeleteTokenSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    follow: _zod.z.string().prefault(""),
    userId: _zod.z.uuid(),
    documentId: _zod.z.uuid(),
    token: _zod.z.string()
  })
});