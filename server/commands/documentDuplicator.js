"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentDuplicator;
var _sequelize = require("sequelize");
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _documentCreator = _interopRequireDefault(require("./documentCreator"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function documentDuplicator(ctx, _ref) {
  let {
    document,
    collection,
    parentDocumentId,
    title,
    publish,
    recursive
  } = _ref;
  const newDocuments = [];
  const sharedProperties = {
    collectionId: collection?.id,
    publish: publish ?? !!document.publishedAt
  };
  const duplicated = await (0, _documentCreator.default)(ctx, {
    parentDocumentId,
    icon: document.icon,
    color: document.color,
    fullWidth: document.fullWidth,
    title: title ?? document.title,
    content: _ProsemirrorHelper.ProsemirrorHelper.removeMarks(_DocumentHelper.DocumentHelper.toProsemirror(document), ["comment"]),
    sourceMetadata: {
      ...document.sourceMetadata,
      originalDocumentId: document.id
    },
    ...sharedProperties
  });
  duplicated.collection = collection ?? null;
  newDocuments.push(duplicated);
  const originalCollection = document?.collectionId ? await _models.Collection.findByPk(document.collectionId, {
    attributes: {
      include: ["documentStructure"]
    }
  }) : null;
  async function duplicateChildDocuments(original, duplicatedDocument) {
    const childDocuments = await original.findChildDocuments({
      archivedAt: original.archivedAt ? {
        [_sequelize.Op.ne]: null
      } : {
        [_sequelize.Op.eq]: null
      }
    }, ctx);
    const sorted = _DocumentHelper.DocumentHelper.sortDocumentsByStructure(childDocuments, originalCollection?.getDocumentTree(original.id)?.children ?? []).reverse(); // we have to reverse since the child documents will be added in reverse order

    for (const childDocument of sorted) {
      const duplicatedChildDocument = await (0, _documentCreator.default)(ctx, {
        parentDocumentId: duplicatedDocument.id,
        icon: childDocument.icon,
        color: childDocument.color,
        fullWidth: childDocument.fullWidth,
        title: childDocument.title,
        content: _ProsemirrorHelper.ProsemirrorHelper.removeMarks(_DocumentHelper.DocumentHelper.toProsemirror(childDocument), ["comment"]),
        sourceMetadata: {
          ...childDocument.sourceMetadata,
          originalDocumentId: childDocument.id
        },
        ...sharedProperties
      });
      duplicatedChildDocument.collection = collection ?? null;
      newDocuments.push(duplicatedChildDocument);
      await duplicateChildDocuments(childDocument, duplicatedChildDocument);
    }
  }
  if (recursive) {
    await duplicateChildDocuments(document, duplicated);
  }
  return newDocuments;
}