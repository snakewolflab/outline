"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
class CollectionAddUserNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const recipient = await _models.User.findByPk(event.userId);
    if (!recipient) {
      return;
    }
    if (!recipient.isSuspended && recipient.subscribedToEventType(_types.NotificationEventType.AddUserToCollection)) {
      await _models.Notification.create({
        event: _types.NotificationEventType.AddUserToCollection,
        userId: event.userId,
        actorId: event.actorId,
        teamId: event.teamId,
        collectionId: event.collectionId
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CollectionAddUserNotificationsTask;