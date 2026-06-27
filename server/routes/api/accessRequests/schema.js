"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccessRequestsInfoSchema = exports.AccessRequestsDismissSchema = exports.AccessRequestsCreateSchema = exports.AccessRequestsApproveSchema = void 0;
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../schema");
var _zod2 = require("../../../utils/zod");
const BaseIdSchema = _zod.z.object({
  id: _zod.z.string().uuid()
});
const AccessRequestsCreateSchema = exports.AccessRequestsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: (0, _zod2.zodIdType)()
  })
});
const AccessRequestsInfoSchema = exports.AccessRequestsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    documentId: (0, _zod2.zodIdType)().optional()
  }).refine(data => data.id || data.documentId, {
    message: "Either 'id' or 'documentId' must be provided",
    path: ["body"]
  })
});
const AccessRequestsApproveSchema = exports.AccessRequestsApproveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    permission: _zod.z.nativeEnum(_types.DocumentPermission).default(_types.DocumentPermission.Read)
  })
});
const AccessRequestsDismissSchema = exports.AccessRequestsDismissSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});