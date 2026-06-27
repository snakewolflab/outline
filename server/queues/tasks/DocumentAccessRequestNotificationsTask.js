"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _compat = require("es-toolkit/compat");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _AccessRequest = require("../../models/AccessRequest");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Notification task that sends notifications to users who can manage a document
 * when someone requests access to it.
 */
class DocumentAccessRequestNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const document = await _models.Document.findByPk(event.documentId);
    if (!document) {
      _Logger.default.debug("task", `Document not found for access request notification`, {
        documentId: event.documentId
      });
      return;
    }
    const accessRequest = await _models.AccessRequest.findByPk(event.modelId);
    if (!accessRequest || accessRequest.status !== _AccessRequest.AccessRequestStatus.Pending) {
      _Logger.default.debug("task", `Access request not pending for notification`, {
        documentId: event.documentId,
        accessRequestId: event.modelId
      });
      return;
    }
    const recipients = await this.findDocumentAdmins(document);
    _Logger.default.debug("task", "Access request notification recipients", {
      documentId: event.documentId,
      accessRequestId: event.modelId,
      recipientIds: recipients.map(r => r.id)
    });
    for (const recipient of recipients) {
      if (recipient.id === event.actorId) {
        _Logger.default.debug("task", "Skipping recipient: is the actor", {
          documentId: event.documentId,
          recipientId: recipient.id
        });
        continue;
      }
      if (!recipient.subscribedToEventType(_types.NotificationEventType.RequestDocumentAccess)) {
        _Logger.default.debug("task", "Skipping recipient: not subscribed", {
          documentId: event.documentId,
          recipientId: recipient.id
        });
        continue;
      }
      await _models.Notification.create({
        event: _types.NotificationEventType.RequestDocumentAccess,
        userId: recipient.id,
        actorId: event.actorId,
        teamId: event.teamId,
        documentId: event.documentId,
        accessRequestId: accessRequest.id
      });
    }
  }

  /**
   * Find users who can manage the document, with tiered fallback:
   * document admins → collection admins → workspace admins. The first tier
   * with any users is used.
   *
   * @param document - the document to find managers for.
   * @returns list of users who can manage the document.
   */
  async findDocumentAdmins(document) {
    const documentManagerIds = await _models.Document.membershipUserIds(document.id, _types.DocumentPermission.Admin);
    if (documentManagerIds.length > 0) {
      return this.loadUsers(documentManagerIds, document.teamId);
    }
    if (document.collectionId) {
      const collectionManagerIds = await _models.Collection.membershipUserIds(document.collectionId, _types.CollectionPermission.Admin);
      if (collectionManagerIds.length > 0) {
        return this.loadUsers(collectionManagerIds, document.teamId);
      }
    }
    _Logger.default.debug("task", "Falling back to workspace admins", {
      documentId: document.id,
      collectionId: document.collectionId
    });
    return _models.User.findAll({
      where: {
        teamId: document.teamId,
        role: _types.UserRole.Admin,
        suspendedAt: null
      }
    });
  }
  async loadUsers(ids, teamId) {
    return _models.User.findAll({
      where: {
        id: {
          [_sequelize.Op.in]: (0, _compat.uniq)(ids)
        },
        teamId,
        suspendedAt: null
      }
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DocumentAccessRequestNotificationsTask;