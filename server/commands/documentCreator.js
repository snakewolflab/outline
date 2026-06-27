"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorizeDocumentCreate = authorizeDocumentCreate;
exports.authorizeDocumentPublish = authorizeDocumentPublish;
exports.default = documentCreator;
var _TextHelper = require("../../shared/utils/TextHelper");
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _policies = require("../policies");
var _validation = require("../validation");
/**
 * Authorizes the creation of a document at the requested location and resolves
 * the collection and parent document it will belong to. Shared by the
 * documents.create API route and the MCP create_document tool so that both
 * enforce identical permissions, including the team-level check that prevents
 * viewers and guests from creating drafts with no collection.
 *
 * @param ctx the API context containing the acting user.
 * @param location the requested collection and/or parent document.
 * @returns the resolved collection and parent document, when applicable.
 * @throws AuthorizationError when the user may not create the document.
 */
async function authorizeDocumentCreate(ctx, _ref) {
  let {
    collectionId,
    parentDocumentId
  } = _ref;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  if (parentDocumentId) {
    const parentDocument = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id,
      transaction
    });
    const collection = parentDocument?.collectionId ? await _models.Collection.findByPk(parentDocument.collectionId, {
      userId: user.id,
      transaction
    }) : undefined;
    (0, _policies.authorize)(user, "createChildDocument", parentDocument, {
      collection
    });
    return {
      collection,
      parentDocument
    };
  }
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "createDocument", collection);
    return {
      collection
    };
  }
  (0, _policies.authorize)(user, "createDocument", user.team);
  return {};
}

/**
 * Authorizes publishing a document into a collection and resolves the target
 * collection. Shared by the documents.update API route and the MCP
 * update_document tool. Publishing places a document into a collection, so it
 * requires create permission on the destination — separate from the update
 * permission that governs editing a draft's content.
 *
 * @param ctx the API context containing the acting user.
 * @param document the document being published.
 * @param collectionId the destination collection, required when publishing a draft that has none.
 * @returns the resolved destination collection.
 * @throws AuthorizationError when the user may not publish into the collection.
 */
async function authorizeDocumentPublish(ctx, document, collectionId) {
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  let collection = document.collection;
  if (document.isDraft) {
    (0, _policies.authorize)(user, "publish", document);
  }
  if (!document.collectionId) {
    (0, _validation.assertPresent)(collectionId, "collectionId is required to publish a draft without collection");
    collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
  }
  if (document.parentDocumentId) {
    const parentDocument = await _models.Document.findByPk(document.parentDocumentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "createChildDocument", parentDocument, {
      collection
    });
  } else {
    (0, _policies.authorize)(user, "createDocument", collection);
  }
  return collection;
}
async function documentCreator(ctx, _ref2) {
  let {
    title,
    text,
    icon,
    color,
    state,
    id,
    urlId,
    publish,
    index,
    collectionId,
    parentDocumentId,
    content,
    template,
    fullWidth,
    importId,
    apiImportId,
    createdAt,
    // allows override for import
    updatedAt,
    editorVersion,
    publishedAt,
    sourceMetadata,
    createdById,
    lastModifiedById
  } = _ref2;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const templateId = template ? template.id : undefined;
  const eventData = importId || apiImportId ? {
    source: "import"
  } : undefined;
  if (state && template) {
    throw new Error("State cannot be set when creating a document from a template");
  }
  if (urlId) {
    const existing = await _models.Document.unscoped().findOne({
      attributes: ["id"],
      transaction,
      where: {
        urlId
      }
    });
    if (existing) {
      urlId = undefined;
    }
  }
  const titleWithReplacements = title ?? (template ? _TextHelper.TextHelper.replaceTemplateVariables(template.title, user) : "");
  const contentWithReplacements = content ? content : text ? _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(text).toJSON() : template ? _ProsemirrorHelper.ProsemirrorHelper.replaceTemplateVariables(await _DocumentHelper.DocumentHelper.toJSON(template), user) : _ProsemirrorHelper.ProsemirrorHelper.toProsemirror("").toJSON();
  const document = _models.Document.build({
    id,
    urlId,
    parentDocumentId,
    editorVersion,
    collectionId,
    teamId: user.teamId,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    lastModifiedById: lastModifiedById ?? createdById ?? user.id,
    createdById: createdById ?? user.id,
    templateId,
    publishedAt,
    importId,
    apiImportId,
    sourceMetadata,
    fullWidth: fullWidth ?? template?.fullWidth,
    icon: icon ?? template?.icon,
    color: color ?? template?.color,
    title: titleWithReplacements,
    content: contentWithReplacements,
    state
  });
  document.text = await _DocumentHelper.DocumentHelper.toMarkdown(document, {
    includeTitle: false
  });
  await document.saveWithCtx(ctx, {
    silent: !!createdAt
  }, {
    data: eventData
  });
  if (publish) {
    if (!collectionId) {
      throw new Error("Collection ID is required to publish");
    }
    await document.publish(ctx, {
      collectionId,
      silent: true,
      index,
      event: !!document.title,
      data: eventData
    });
  }

  // reload to get all of the data needed to present (user, collection etc)
  // we need to specify publishedAt to bypass default scope that only returns
  // published documents
  return _models.Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
}