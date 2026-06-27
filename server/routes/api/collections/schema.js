"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionsUpdateSchema = exports.CollectionsRestoreSchema = exports.CollectionsRemoveUserSchema = exports.CollectionsRemoveGroupSchema = exports.CollectionsMoveSchema = exports.CollectionsMembershipsSchema = exports.CollectionsListSchema = exports.CollectionsInfoSchema = exports.CollectionsImportSchema = exports.CollectionsExportSchema = exports.CollectionsExportAllSchema = exports.CollectionsDocumentsSchema = exports.CollectionsDeleteSchema = exports.CollectionsCreateSchema = exports.CollectionsArchivedSchema = exports.CollectionsArchiveSchema = exports.CollectionsAddUserSchema = exports.CollectionsAddGroupSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _models = require("../../../models");
var _zod2 = require("../../../utils/zod");
var _validation = require("../../../validation");
var _schema = require("../schema");
const BaseIdSchema = _zod.z.object({
  /** Id of the collection to be updated */
  id: (0, _zod2.zodIdType)()
});

/** The landing page can be set from description (markdown) or data (rich content), but not both. */
const refineBodyContent = body => (0, _compat.isUndefined)(body.description) || (0, _compat.isUndefined)(body.data);
const bodyContentError = {
  error: "Only one of description or data may be provided"
};
const CollectionsCreateSchema = exports.CollectionsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    name: _zod.z.string(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    description: _zod.z.string().nullish(),
    data: (0, _schema.ProsemirrorSchema)({
      allowEmpty: true
    }).nullish(),
    permission: _zod.z.enum(_types.CollectionPermission).nullish().transform(val => (0, _compat.isUndefined)(val) ? null : val),
    sharing: _zod.z.boolean().prefault(true),
    icon: (0, _zod2.zodIconType)().optional(),
    sort: _zod.z.object({
      field: _zod.z.union([_zod.z.literal("title"), _zod.z.literal("index")]),
      direction: _zod.z.union([_zod.z.literal("asc"), _zod.z.literal("desc")])
    }).prefault(_models.Collection.DEFAULT_SORT),
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    }).max(_validation.ValidateIndex.maxLength, {
      message: `Must be ${_validation.ValidateIndex.maxLength} or fewer characters long`
    }).optional(),
    commenting: _zod.z.boolean().nullish(),
    templateManagement: _zod.z.enum([_types.CollectionPermission.Admin, _types.CollectionPermission.ReadWrite]).prefault(_types.CollectionPermission.Admin)
  }).refine(refineBodyContent, bodyContentError)
});
const CollectionsInfoSchema = exports.CollectionsInfoSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Share Id, if available */
    shareId: (0, _zod2.zodShareIdType)().optional()
  })
});
const CollectionsDocumentsSchema = exports.CollectionsDocumentsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsImportSchema = exports.CollectionsImportSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    permission: _zod.z.enum(_types.CollectionPermission).nullish().transform(val => (0, _compat.isUndefined)(val) ? null : val),
    attachmentId: _zod.z.uuid(),
    /**
     * The format of the upload. Both `json` and `outline-markdown` are
     * routed through the API-import pipeline (see `imports.create`); the
     * `format` field is retained for backwards compatibility with API
     * clients calling this endpoint directly.
     */
    format: _zod.z.enum([_types.FileOperationFormat.JSON, _types.FileOperationFormat.MarkdownZip]).prefault(_types.FileOperationFormat.JSON)
  })
});
const CollectionsAddGroupSchema = exports.CollectionsAddGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.uuid(),
    permission: _zod.z.enum(_types.CollectionPermission).prefault(_types.CollectionPermission.ReadWrite)
  })
});
const CollectionsRemoveGroupSchema = exports.CollectionsRemoveGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.uuid()
  })
});
const CollectionsAddUserSchema = exports.CollectionsAddUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    userId: _zod.z.uuid(),
    permission: _zod.z.enum(_types.CollectionPermission).optional()
  })
});
const CollectionsRemoveUserSchema = exports.CollectionsRemoveUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    userId: _zod.z.uuid()
  })
});
const CollectionsMembershipsSchema = exports.CollectionsMembershipsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    query: _zod.z.string().optional(),
    permission: _zod.z.enum(_types.CollectionPermission).optional()
  })
});
const CollectionsExportSchema = exports.CollectionsExportSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    format: _zod.z.enum(_types.FileOperationFormat).prefault(_types.FileOperationFormat.MarkdownZip),
    includeAttachments: _zod.z.boolean().prefault(true)
  })
});
const CollectionsExportAllSchema = exports.CollectionsExportAllSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    format: _zod.z.enum(_types.FileOperationFormat).prefault(_types.FileOperationFormat.MarkdownZip),
    includeAttachments: _zod.z.boolean().prefault(true),
    includePrivate: _zod.z.boolean().prefault(true)
  })
});
const CollectionsUpdateSchema = exports.CollectionsUpdateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    name: _zod.z.string().optional(),
    description: _zod.z.string().nullish(),
    data: (0, _schema.ProsemirrorSchema)({
      allowEmpty: true
    }).nullish(),
    icon: (0, _zod2.zodIconType)().nullish(),
    permission: _zod.z.enum(_types.CollectionPermission).nullish(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    sort: _zod.z.object({
      field: _zod.z.union([_zod.z.literal("title"), _zod.z.literal("index")]),
      direction: _zod.z.union([_zod.z.literal("asc"), _zod.z.literal("desc")])
    }).optional(),
    sharing: _zod.z.boolean().optional(),
    commenting: _zod.z.boolean().nullish(),
    templateManagement: _zod.z.enum([_types.CollectionPermission.Admin, _types.CollectionPermission.ReadWrite]).optional()
  }).refine(refineBodyContent, bodyContentError)
});
const CollectionsListSchema = exports.CollectionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    includeListOnly: _zod.z.boolean().prefault(false),
    query: _zod.z.string().optional(),
    /** Collection statuses to include in results */
    statusFilter: _zod.z.enum(_types.CollectionStatusFilter).array().optional()
  })
});
const CollectionsDeleteSchema = exports.CollectionsDeleteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsArchiveSchema = exports.CollectionsArchiveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsRestoreSchema = exports.CollectionsRestoreSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsArchivedSchema = exports.CollectionsArchivedSchema = _schema.BaseSchema;
const CollectionsMoveSchema = exports.CollectionsMoveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    }).max(_validation.ValidateIndex.maxLength, {
      message: `Must be ${_validation.ValidateIndex.maxLength} or fewer characters long`
    })
  })
});