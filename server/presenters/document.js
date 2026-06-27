"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.presentDocuments = presentDocuments;
var _sequelize = require("sequelize");
var _time = require("../../shared/utils/time");
var _tracing = require("../logging/tracing");
var _FileOperation = _interopRequireDefault(require("../models/FileOperation"));
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentDocument(ctx, document) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  options = {
    isPublic: false,
    ...options
  };
  const asData = !ctx || Number(ctx?.headers["x-api-version"] ?? 0) >= 3;
  const data = await _DocumentHelper.DocumentHelper.toJSON(document, options.isPublic ? {
    signedUrls: _time.Hour.seconds,
    teamId: document.teamId,
    removeMarks: ["comment"],
    internalUrlBase: `/s/${options.shareId}`
  } : undefined);
  const text = !asData || options?.includeText ? await _DocumentHelper.DocumentHelper.toMarkdown(data, {
    includeTitle: false
  }) : undefined;
  const res = {
    id: document.id,
    url: document.path,
    urlId: document.urlId,
    title: document.title,
    data: options?.includeData === false ? undefined : asData || options?.includeData ? data : undefined,
    text,
    icon: document.icon,
    color: document.color,
    tasks: {
      completed: 0,
      total: 0
    },
    language: document.language,
    createdAt: document.createdAt,
    createdBy: undefined,
    updatedAt: document.updatedAt,
    updatedBy: undefined,
    publishedAt: document.publishedAt,
    archivedAt: document.archivedAt,
    deletedAt: document.deletedAt,
    collaboratorIds: [],
    revision: document.revisionCount,
    fullWidth: document.fullWidth,
    collectionId: undefined,
    parentDocumentId: undefined,
    lastViewedAt: undefined,
    isCollectionDeleted: undefined,
    backlinkIds: options?.backlinkIds
  };
  if (!!document.views && document.views.length > 0) {
    res.lastViewedAt = document.views[0].updatedAt;
  }
  if (options.isPublic && !options.includeUpdatedAt) {
    delete res.updatedAt;
  }
  if (document.summary) {
    res.summary = document.summary;
  }
  if (!options.isPublic) {
    res.tasks = document.tasks;
    res.isCollectionDeleted = await document.isCollectionDeleted();
    res.collectionId = document.collectionId;
    res.parentDocumentId = document.parentDocumentId;
    res.createdBy = (0, _user.default)(document.createdBy);
    res.updatedBy = (0, _user.default)(document.updatedBy);
    res.collaboratorIds = document.collaboratorIds ?? [];
    res.templateId = document.templateId;
    res.insightsEnabled = document.insightsEnabled;
    res.popularityScore = document.popularityScore;
    if (options.includeCommentCount) {
      res.commentCount = await document.commentCount;
    }
    if (document.sourceMetadata) {
      const source = document.import ?? (await document.$get("import"));
      res.sourceMetadata = {
        importedAt: source?.createdAt ?? document.createdAt,
        importType: source?.format,
        createdByName: document.sourceMetadata.createdByName,
        fileName: document.sourceMetadata?.fileName,
        originalDocumentId: document.sourceMetadata?.originalDocumentId
      };
    }
  }
  return res;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentDocument);
/**
 * Batch-present multiple documents, fetching all related FileOperation records
 * in a single query instead of one per document.
 *
 * @param ctx the API context.
 * @param documents the documents to present.
 * @param options presentation options forwarded to presentDocument.
 * @returns array of presented document objects.
 */
async function presentDocuments(ctx, documents, options) {
  const opts = {
    isPublic: false,
    ...options
  };
  if (!opts.isPublic) {
    const importIds = documents.filter(doc => doc.sourceMetadata && doc.importId).map(doc => doc.importId);
    if (importIds.length > 0) {
      const sources = await _FileOperation.default.unscoped().findAll({
        where: {
          id: {
            [_sequelize.Op.in]: importIds
          }
        }
      });
      const sourceMap = new Map(sources.map(s => [s.id, s]));
      for (const doc of documents) {
        if (doc.importId) {
          doc.import = sourceMap.get(doc.importId) ?? null;
        }
      }
    }
  }
  return Promise.all(documents.map(document => presentDocument(ctx, document, opts)));
}