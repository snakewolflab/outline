"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentShare;
var _ = require(".");
function presentShare(share) {
  let isAdmin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  const data = {
    id: share.id,
    sourceTitle: share.collection?.name ?? share.document?.title,
    sourcePath: share.collection?.path ?? share.document?.path,
    collectionId: share.collectionId,
    documentId: share.documentId,
    documentTitle: share.document?.title,
    documentUrl: share.document?.url,
    published: share.published,
    url: share.canonicalUrl,
    urlId: share.urlId,
    createdBy: (0, _.presentUser)(share.user),
    includeChildDocuments: share.includeChildDocuments,
    allowIndexing: share.allowIndexing,
    allowSubscriptions: share.allowSubscriptions,
    showLastUpdated: share.showLastUpdated,
    showTOC: share.showTOC,
    title: share.title,
    iconUrl: share.iconUrl,
    lastAccessedAt: share.lastAccessedAt || undefined,
    views: share.views || 0,
    domain: share.domain,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt
  };
  if (!isAdmin) {
    delete data.lastAccessedAt;
  }
  return data;
}