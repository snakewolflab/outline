"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharesUpdateSchema = exports.SharesUnsubscribeSchema = exports.SharesSubscribeSchema = exports.SharesSitemapSchema = exports.SharesRevokeSchema = exports.SharesListSchema = exports.SharesInfoSchema = exports.SharesCreateSchema = exports.SharesConfirmSubscriptionSchema = void 0;
var _classValidator = require("class-validator");
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _UrlHelper = require("../../../../shared/utils/UrlHelper");
var _validations = require("../../../../shared/validations");
var _models = require("../../../models");
var _validation = require("../../../validation");
var _zod2 = require("../../../utils/zod");
var _schema = require("../schema");
const SharesInfoSchema = exports.SharesInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().optional(),
    collectionId: (0, _zod2.zodIdType)().optional(),
    documentId: (0, _zod2.zodIdType)().optional()
  }).refine(body => !((0, _compat.isEmpty)(body.id) && (0, _compat.isEmpty)(body.collectionId) && (0, _compat.isEmpty)(body.documentId)), {
    error: "one of id, collectionId, or documentId is required"
  })
});
const SharesListSchema = exports.SharesListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    query: _zod.z.string().optional(),
    sort: _zod.z.string().refine(val => Object.keys(_models.Share.getAttributes()).includes(val), {
      message: `must be one of ${Object.keys(_models.Share.getAttributes()).join(", ")}`
    }).prefault("updatedAt"),
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
  })
});
const SharesUpdateSchema = exports.SharesUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    includeChildDocuments: _zod.z.boolean().optional(),
    published: _zod.z.boolean().optional(),
    allowIndexing: _zod.z.boolean().optional(),
    allowSubscriptions: _zod.z.boolean().optional(),
    showLastUpdated: _zod.z.boolean().optional(),
    showTOC: _zod.z.boolean().optional(),
    title: _zod.z.string().max(_validations.ShareValidation.maxTitleLength).nullish(),
    iconUrl: _zod.z.string().max(_validations.ShareValidation.maxIconUrlLength).refine(val => (0, _classValidator.isURL)(val, {
      require_host: false,
      require_protocol: false
    }), {
      error: _validation.ValidateURL.message
    }).nullish(),
    urlId: _zod.z.string().regex(_UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX, {
      error: "must contain only alphanumeric and dashes"
    }).nullish()
  })
});
const SharesCreateSchema = exports.SharesCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    collectionId: (0, _zod2.zodIdType)().optional(),
    documentId: (0, _zod2.zodIdType)().optional(),
    published: _zod.z.boolean().prefault(false),
    allowIndexing: _zod.z.boolean().optional(),
    allowSubscriptions: _zod.z.boolean().optional(),
    showLastUpdated: _zod.z.boolean().optional(),
    showTOC: _zod.z.boolean().optional(),
    urlId: _zod.z.string().regex(_UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX, {
      error: "must contain only alphanumeric and dashes"
    }).optional(),
    includeChildDocuments: _zod.z.boolean().prefault(false)
  }).refine(obj => !((0, _compat.isEmpty)(obj.collectionId) && (0, _compat.isEmpty)(obj.documentId)), {
    error: "one of collectionId or documentId is required"
  }).refine(obj => !(!(0, _compat.isEmpty)(obj.collectionId) && !(0, _compat.isEmpty)(obj.documentId)), {
    error: "only one of collectionId or documentId may be provided"
  })
});
const SharesRevokeSchema = exports.SharesRevokeSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});
const SharesSitemapSchema = exports.SharesSitemapSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    id: _zod.z.string()
  })
});
const SharesSubscribeSchema = exports.SharesSubscribeSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    shareId: _zod.z.string(),
    documentId: _zod.z.uuid(),
    email: _zod.z.string().email()
  })
});
const SharesConfirmSubscriptionSchema = exports.SharesConfirmSubscriptionSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    id: _zod.z.uuid(),
    token: _zod.z.string(),
    follow: _zod.z.string().optional()
  })
});
const SharesUnsubscribeSchema = exports.SharesUnsubscribeSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    id: _zod.z.uuid(),
    token: _zod.z.string(),
    follow: _zod.z.string().optional()
  })
});