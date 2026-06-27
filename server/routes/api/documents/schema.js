"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocumentsViewedSchema = exports.DocumentsUsersSchema = exports.DocumentsUpdateSchema = exports.DocumentsUnpublishSchema = exports.DocumentsTemplatizeSchema = exports.DocumentsSitemapSchema = exports.DocumentsSharedWithUserSchema = exports.DocumentsSearchTitlesSchema = exports.DocumentsSearchSchema = exports.DocumentsRestoreSchema = exports.DocumentsRemoveUserSchema = exports.DocumentsRemoveGroupSchema = exports.DocumentsMoveSchema = exports.DocumentsMembershipsSchema = exports.DocumentsListSchema = exports.DocumentsInsightsSchema = exports.DocumentsInfoSchema = exports.DocumentsImportSchema = exports.DocumentsExportSchema = exports.DocumentsDuplicateSchema = exports.DocumentsDraftsSchema = exports.DocumentsDeletedSchema = exports.DocumentsDeleteSchema = exports.DocumentsCreateSchema = exports.DocumentsChildrenSchema = exports.DocumentsArchivedSchema = exports.DocumentsArchiveSchema = exports.DocumentsAddUserSchema = exports.DocumentsAddGroupSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../schema");
var _zod2 = require("../../../utils/zod");
var _validation = require("../../../validation");
const DocumentsSortParamsSchema = _zod.z.object({
  /** Specifies the attributes by which documents will be sorted in the list */
  sort: _zod.z.string().refine(val => ["createdAt", "updatedAt", "publishedAt", "index", "title", "popularityScore"].includes(val)).prefault("updatedAt"),
  /** Specifies the sort order with respect to sort field */
  direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
});
const DateFilterSchema = _zod.z.object({
  /** Date filter */
  dateFilter: _zod.z.union([_zod.z.literal("day"), _zod.z.literal("week"), _zod.z.literal("month"), _zod.z.literal("year")]).optional()
});
const BaseSearchSchema = DateFilterSchema.extend({
  /** Filter results for team based on the collection */
  collectionId: _zod.z.uuid().optional(),
  /** Filter results based on user */
  userId: _zod.z.uuid().optional(),
  /** Filter results based on content within a document and it's children */
  documentId: _zod.z.uuid().optional(),
  /** Document statuses to include in results */
  statusFilter: _zod.z.enum(_types.StatusFilter).array().optional(),
  /** Filter results for the team derived from shareId */
  shareId: (0, _zod2.zodShareIdType)().optional(),
  /** Min words to be shown in the results snippets */
  snippetMinWords: _zod.z.number().prefault(20),
  /** Max words to be accomodated in the results snippets */
  snippetMaxWords: _zod.z.number().prefault(30)
});
const BaseIdSchema = _zod.z.object({
  /** Id of the document to be updated */
  id: (0, _zod2.zodIdType)()
});
const DocumentsListSchema = exports.DocumentsListSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema.extend({
    /** Id of the user who created the doc */
    userId: _zod.z.uuid().optional(),
    /** Alias for userId - kept for backwards compatibility */
    user: _zod.z.uuid().optional(),
    /** Id of the collection to which the document belongs */
    collectionId: _zod.z.uuid().optional(),
    /** Alias for collectionId - kept for backwards compatibility */
    collection: _zod.z.uuid().optional(),
    /** Id of the backlinked document */
    backlinkDocumentId: _zod.z.uuid().optional(),
    /** Id of the parent document to which the document belongs */
    parentDocumentId: _zod.z.uuid().nullish(),
    /** Document statuses to include in results */
    statusFilter: _zod.z.enum(_types.StatusFilter).array().optional()
  })
  // Maintains backwards compatibility
}).transform(req => {
  req.body.collectionId = req.body.collectionId || req.body.collection;
  req.body.userId = req.body.userId || req.body.user;
  delete req.body.collection;
  delete req.body.user;
  return req;
});
const DocumentsArchivedSchema = exports.DocumentsArchivedSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema.extend({
    /** Id of the collection to which archived documents should belong */
    collectionId: _zod.z.uuid().optional()
  })
});
const DocumentsDeletedSchema = exports.DocumentsDeletedSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema.extend({})
});
const DocumentsViewedSchema = exports.DocumentsViewedSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema.extend({})
});
const DocumentsDraftsSchema = exports.DocumentsDraftsSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema.extend(DateFilterSchema.shape).extend({
    /** Id of the collection to which the document belongs */
    collectionId: _zod.z.uuid().optional()
  })
});
const DocumentsInfoSchema = exports.DocumentsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: (0, _zod2.zodIdType)().optional(),
    /** Share Id, if available */
    shareId: (0, _zod2.zodShareIdType)().optional(),
    /** @deprecated Version of the API to be used, remove in a few releases */
    apiVersion: _zod.z.number().optional()
  })
}).refine(req => !((0, _compat.isEmpty)(req.body.id) && (0, _compat.isEmpty)(req.body.shareId)), {
  message: "one of id or shareId is required"
});
const DocumentsInsightsSchema = exports.DocumentsInsightsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Start of the insights window (inclusive). Defaults to 30 days ago. */
    startDate: _zod.z.coerce.date().optional(),
    /** End of the insights window (inclusive). Defaults to today. */
    endDate: _zod.z.coerce.date().optional()
  })
}).refine(req => !req.body.startDate || !req.body.endDate || req.body.startDate <= req.body.endDate, {
  message: "startDate must be on or before endDate"
});
const DocumentsExportSchema = exports.DocumentsExportSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    signedUrls: _zod.z.number().optional(),
    includeChildDocuments: _zod.z.boolean().prefault(false)
  })
});
const DocumentsRestoreSchema = exports.DocumentsRestoreSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Id of the collection to which the document belongs */
    collectionId: _zod.z.uuid().optional(),
    /** Id of document revision */
    revisionId: _zod.z.uuid().optional()
  })
});
const DocumentsSearchSchema = exports.DocumentsSearchSchema = _schema.BaseSchema.extend({
  body: BaseSearchSchema.extend({
    /** Query for search */
    query: _zod.z.string().optional(),
    /** Specifies the attributes by which search results will be sorted */
    sort: _zod.z.enum(Object.values(_types.SortFilter)).optional(),
    /** Specifies the sort order with respect to sort field */
    direction: _zod.z.enum(Object.values(_types.DirectionFilter)).optional()
  })
});
const DocumentsSearchTitlesSchema = exports.DocumentsSearchTitlesSchema = _schema.BaseSchema.extend({
  body: BaseSearchSchema.extend({
    /** Query for search */
    query: _zod.z.string().refine(val => val.trim() !== ""),
    /** Specifies the attributes by which search results will be sorted */
    sort: _zod.z.enum(Object.values(_types.SortFilter)).optional(),
    /** Specifies the sort order with respect to sort field */
    direction: _zod.z.enum(Object.values(_types.DirectionFilter)).optional()
  })
});
const DocumentsDuplicateSchema = exports.DocumentsDuplicateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** New document title */
    title: _zod.z.string().optional(),
    /** Whether child documents should also be duplicated */
    recursive: _zod.z.boolean().optional(),
    /** Whether the new document should be published */
    publish: _zod.z.boolean().optional(),
    /** Id of the collection to which the document should be copied */
    collectionId: _zod.z.uuid().optional(),
    /** Id of the parent document to which the document should be copied */
    parentDocumentId: _zod.z.uuid().optional()
  })
});
const DocumentsTemplatizeSchema = exports.DocumentsTemplatizeSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Id of the collection inside which the template should be created */
    collectionId: _zod.z.string().nullish(),
    /** Whether the new template should be published */
    publish: _zod.z.boolean()
  })
});
const DocumentsUpdateSchema = exports.DocumentsUpdateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Doc title to be updated */
    title: _zod.z.string().optional(),
    /** Doc text to be updated */
    text: _zod.z.string().optional(),
    /** Icon displayed alongside doc title */
    icon: (0, _zod2.zodIconType)().nullish(),
    /** Icon color */
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    /** Boolean to denote if the doc should occupy full width */
    fullWidth: _zod.z.boolean().optional(),
    /** Boolean to denote if insights should be visible on the doc */
    insightsEnabled: _zod.z.boolean().optional(),
    /** Boolean to denote if the doc should be published */
    publish: _zod.z.boolean().optional(),
    /** Doc template Id */
    templateId: _zod.z.uuid().nullish(),
    /** Doc collection Id */
    collectionId: _zod.z.uuid().nullish(),
    /** @deprecated Use editMode instead */
    append: _zod.z.boolean().optional(),
    /** The edit mode for text updates: "replace", "append", "prepend", or "patch" */
    editMode: _zod.z.enum(_types.TextEditMode).optional(),
    /** The markdown text to find when using "patch" edit mode */
    findText: _zod.z.string().optional(),
    /** @deprecated Version of the API to be used, remove in a few releases */
    apiVersion: _zod.z.number().optional(),
    /** Whether the editing session is complete */
    done: _zod.z.boolean().optional()
  })
}).refine(req => !((req.body.append || req.body.editMode === _types.TextEditMode.Append || req.body.editMode === _types.TextEditMode.Prepend) && !req.body.text), {
  message: "text is required when using append, prepend, or editMode"
}).refine(req => !(req.body.editMode === _types.TextEditMode.Patch && req.body.text === undefined), {
  message: "text is required when using patch editMode"
}).refine(req => !(req.body.editMode === _types.TextEditMode.Patch && !req.body.findText), {
  message: "findText is required when using patch editMode"
}).transform(req => {
  // Transform deprecated append to editMode for backwards compatibility
  if (req.body.append && !req.body.editMode) {
    req.body.editMode = _types.TextEditMode.Append;
  }
  delete req.body.append;
  return req;
});
const DocumentsMoveSchema = exports.DocumentsMoveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Id of collection to which the doc is supposed to be moved */
    collectionId: _zod.z.uuid().optional().nullish(),
    /** Parent Id, in case if the doc is moved to a new parent */
    parentDocumentId: _zod.z.uuid().nullish(),
    /** Helps evaluate the new index in collection structure upon move */
    index: _zod.z.number().gte(0).optional()
  })
}).refine(req => !(req.body.parentDocumentId === req.body.id), {
  message: "infinite loop detected, cannot nest a document inside itself"
});
const DocumentsArchiveSchema = exports.DocumentsArchiveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const DocumentsDeleteSchema = exports.DocumentsDeleteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Whether to permanently delete the doc as opposed to soft-delete */
    permanent: _zod.z.boolean().optional()
  })
});
const DocumentsUnpublishSchema = exports.DocumentsUnpublishSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Whether to detach the document from the collection */
    detach: _zod.z.boolean().prefault(false),
    /** @deprecated Version of the API to be used, remove in a few releases */
    apiVersion: _zod.z.number().optional()
  })
});
const DocumentsImportSchema = exports.DocumentsImportSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Whether to publish the imported docs. String as this is always multipart/form-data */
    publish: _zod.z.union([_zod.z.boolean(), _zod.z.preprocess(val => val === "true", _zod.z.boolean())]).optional(),
    /** Import docs to this collection */
    collectionId: _zod.z.uuid().nullish(),
    /** Import under this parent doc */
    parentDocumentId: _zod.z.uuid().nullish(),
    /** ID of a pre-uploaded attachment to import from */
    attachmentId: _zod.z.uuid().optional()
  }).refine(req => !((0, _compat.isEmpty)(req.collectionId) && (0, _compat.isEmpty)(req.parentDocumentId)), {
    error: "one of collectionId or parentDocumentId is required"
  }),
  file: _zod.z.custom().optional()
});
const DocumentsCreateSchema = exports.DocumentsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the document to be created */
    id: (0, _zod2.zodIdType)().optional(),
    /** Document title */
    title: _zod.z.string().optional(),
    /** Document text */
    text: _zod.z.string().optional(),
    /** Icon displayed alongside doc title */
    icon: (0, _zod2.zodIconType)().optional(),
    /** Icon color */
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    /** Boolean to denote if the doc should be published */
    publish: _zod.z.boolean().optional(),
    /** Collection to create document within  */
    collectionId: _zod.z.uuid().nullish(),
    /** Index to create the document at within the collection */
    index: _zod.z.number().optional(),
    /** Parent document to create within */
    parentDocumentId: _zod.z.uuid().nullish(),
    /** A template to create the document from */
    templateId: _zod.z.uuid().optional(),
    /** Optionally set the created date in the past */
    createdAt: _zod.z.coerce.date().optional().refine(data => !data || data < new Date(), {
      error: "createdAt must be in the past"
    }),
    /** Boolean to denote if the document should occupy full width */
    fullWidth: _zod.z.boolean().optional()
  })
}).refine(req => !(req.body.publish && !req.body.parentDocumentId && !req.body.collectionId), {
  message: "collectionId or parentDocumentId is required to publish"
});
const DocumentsUsersSchema = exports.DocumentsUsersSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Query term to search users by name */
    query: _zod.z.string().optional(),
    /** Id of the user to search within document access */
    userId: _zod.z.uuid().optional()
  })
});
const DocumentsChildrenSchema = exports.DocumentsChildrenSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const DocumentsAddUserSchema = exports.DocumentsAddUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Id of the user who is to be added */
    userId: _zod.z.uuid(),
    /** Permission to be granted to the added user */
    permission: _zod.z.enum(_types.DocumentPermission).optional()
  })
});
const DocumentsRemoveUserSchema = exports.DocumentsRemoveUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Id of the user who is to be removed */
    userId: _zod.z.uuid()
  })
});
const DocumentsAddGroupSchema = exports.DocumentsAddGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.uuid(),
    permission: _zod.z.enum(_types.DocumentPermission).prefault(_types.DocumentPermission.ReadWrite)
  })
});
const DocumentsRemoveGroupSchema = exports.DocumentsRemoveGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.uuid()
  })
});
const DocumentsSharedWithUserSchema = exports.DocumentsSharedWithUserSchema = _schema.BaseSchema.extend({
  body: DocumentsSortParamsSchema
});
const DocumentsMembershipsSchema = exports.DocumentsMembershipsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    query: _zod.z.string().optional(),
    permission: _zod.z.enum(_types.DocumentPermission).optional()
  })
});
const DocumentsSitemapSchema = exports.DocumentsSitemapSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    shareId: (0, _zod2.zodShareIdType)().optional()
  })
});