"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentPermanentDeleter;
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _timers = require("../../shared/utils/timers");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _DeleteAttachmentTask = _interopRequireDefault(require("../queues/tasks/DeleteAttachmentTask"));
var _database = require("../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function documentPermanentDeleter(documents) {
  const activeDocument = documents.find(doc => !doc.deletedAt);
  if (activeDocument) {
    throw new Error(`Cannot permanently delete ${activeDocument.id} document. Please delete it and try again.`);
  }
  const query = `
    SELECT COUNT(id)
    FROM documents
    WHERE "searchVector" @@ to_tsquery('english', :query) AND
    "teamId" = :teamId AND
    "id" != :documentId
  `;
  for (const document of documents) {
    // Find any attachments that are referenced in the text content
    const attachmentIdsInText = _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document));

    // Find any attachments that were originally uploaded to this document
    const attachmentIdsForDocument = (await _models.Attachment.findAll({
      attributes: ["id"],
      where: {
        teamId: document.teamId,
        documentId: document.id
      }
    })).map(attachment => attachment.id);
    const attachmentIds = (0, _compat.uniq)([...attachmentIdsInText, ...attachmentIdsForDocument]);
    await Promise.all(attachmentIds.map(async attachmentId => {
      // Check if the attachment is referenced in any other documents – this
      // is needed as it's easy to copy and paste content between documents.
      // An uploaded attachment may end up referenced in multiple documents.
      const [{
        count
      }] = await _database.sequelize.query(query, {
        type: _sequelize.QueryTypes.SELECT,
        replacements: {
          documentId: document.id,
          teamId: document.teamId,
          query: attachmentId
        }
      });

      // If the attachment is not referenced in any other documents then
      // delete it from the database and the storage provider.
      if (parseInt(count) === 0) {
        _Logger.default.info("commands", `Attachment ${attachmentId} scheduled for deletion`);
        await new _DeleteAttachmentTask.default().schedule({
          attachmentId,
          teamId: document.teamId
        });
      }
    }));
  }
  const documentIds = documents.map(document => document.id);

  // Re-check deletedAt in the database to exclude documents that were restored
  // between the caller's query and now. Otherwise the parentDocumentId clear
  // below would detach children of a restored parent, breaking the hierarchy.
  const stillDeleted = await _models.Document.unscoped().findAll({
    attributes: ["id"],
    where: {
      id: documentIds,
      deletedAt: {
        [_sequelize.Op.ne]: null
      }
    },
    paranoid: false
  });
  const deletedIds = stillDeleted.map(document => document.id);
  for (const batch of (0, _compat.chunk)(deletedIds, 100)) {
    await _models.Document.update({
      parentDocumentId: null
    }, {
      where: {
        parentDocumentId: {
          [_sequelize.Op.in]: batch
        }
      },
      paranoid: false
    });
  }

  // Small batch size and inter-batch sleep keep the exclusive lock window short
  // enough to avoid blocking concurrent web requests, since each delete
  // cascades into vectors, attachments, revisions, comments, and notifications.
  const destroyBatches = (0, _compat.chunk)(deletedIds, 10);
  let totalDeleted = 0;
  for (let i = 0; i < destroyBatches.length; i++) {
    totalDeleted += await _models.Document.scope("withDrafts").destroy({
      where: {
        id: destroyBatches[i],
        deletedAt: {
          [_sequelize.Op.ne]: null
        }
      },
      force: true
    });
    if (i < destroyBatches.length - 1) {
      await (0, _timers.sleep)(100);
    }
  }
  return totalDeleted;
}