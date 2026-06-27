"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tracing = require("../logging/tracing");
var _errors = require("../errors");
var _models = require("../models");
var _policies = require("../policies");
var _validation = require("../validation");
/**
 * Restores a previously archived or deleted document, or restores a document's
 * content to a specific revision. Re-attaches the document to the destination
 * collection's structure when applicable and authorizes the acting user.
 *
 * @param ctx - the API context, providing the acting user and transaction.
 * @param props - the document and restore options.
 * @returns the restored document.
 * @throws ValidationError if the destination collection is not active.
 */
async function documentRestorer(ctx, _ref) {
  let {
    document,
    collectionId,
    revisionId
  } = _ref;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const sourceCollectionId = document.collectionId;
  const destCollectionId = collectionId ?? sourceCollectionId;
  const srcCollection = sourceCollectionId ? await _models.Collection.findByPk(sourceCollectionId, {
    userId: user.id,
    includeDocumentStructure: true,
    paranoid: false,
    transaction
  }) : undefined;
  const destCollection = destCollectionId ? await _models.Collection.findByPk(destCollectionId, {
    userId: user.id,
    includeDocumentStructure: true,
    transaction
  }) : undefined;
  if (!destCollection?.isActive) {
    throw (0, _errors.ValidationError)("Unable to restore, the collection may have been deleted or archived");
  }
  if (sourceCollectionId && sourceCollectionId !== destCollection.id) {
    (0, _policies.authorize)(user, "updateDocument", srcCollection);
    await srcCollection?.removeDocumentInStructure(document, {
      save: true,
      transaction
    });
  }
  if (document.deletedAt) {
    (0, _policies.authorize)(user, "restore", document);
    (0, _policies.authorize)(user, "updateDocument", destCollection);

    // restore a previously deleted document
    await document.restoreTo(ctx, {
      collectionId: destCollection.id
    });
  } else if (document.archivedAt) {
    (0, _policies.authorize)(user, "unarchive", document);
    (0, _policies.authorize)(user, "updateDocument", destCollection);

    // restore a previously archived document
    await document.restoreTo(ctx, {
      collectionId: destCollection.id
    });
  } else if (revisionId) {
    // restore a document to a specific revision
    (0, _policies.authorize)(user, "update", document);
    const revision = await _models.Revision.findByPk(revisionId, {
      transaction
    });
    (0, _policies.authorize)(document, "restore", revision);
    await document.restoreFromRevision(revision);
    await document.saveWithCtx(ctx, undefined, {
      name: "restore"
    });
  } else {
    (0, _validation.assertPresent)(revisionId, "revisionId is required");
  }
  return document;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "documentRestorer"
})(documentRestorer);