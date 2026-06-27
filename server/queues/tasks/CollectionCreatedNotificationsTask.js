"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _NotificationHelper = _interopRequireDefault(require("../../models/helpers/NotificationHelper"));
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CollectionCreatedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const collection = await _models.Collection.findByPk(event.collectionId);

    // We only send notifications for collections visible to the entire team
    if (!collection || collection.isPrivate) {
      return;
    }
    const recipients = await _NotificationHelper.default.getCollectionNotificationRecipients(collection, _types.NotificationEventType.CreateCollection);
    for (const recipient of recipients) {
      // Suppress notifications for suspended users
      if (recipient.isSuspended || !recipient.email) {
        continue;
      }
      await _models.Notification.create({
        event: _types.NotificationEventType.CreateCollection,
        userId: recipient.id,
        collectionId: collection.id,
        actorId: collection.createdById,
        teamId: collection.teamId
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CollectionCreatedNotificationsTask;