"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentAddUserNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const permission = event.changes?.attributes.permission;
    if (!permission) {
      _Logger.default.info("task", `permission not available in the DocumentAddUserNotificationsTask event`, {
        name: event.name,
        modelId: event.modelId
      });
      return;
    }
    const recipient = await _models.User.findByPk(event.userId);
    if (!recipient || recipient.isSuspended || !recipient.subscribedToEventType(_types.NotificationEventType.AddUserToDocument)) {
      return;
    }
    const isElevated = await (0, _permissions.isElevatedPermission)({
      userId: recipient.id,
      documentId: event.documentId,
      permission,
      skipMembershipId: event.modelId
    });
    if (!isElevated) {
      _Logger.default.debug("task", `Suppressing notification for user ${event.userId} as the new permission does not elevate user's permission to the document`, {
        documentId: event.documentId,
        userId: event.userId,
        permission
      });
      return;
    }
    await _models.Notification.create({
      event: _types.NotificationEventType.AddUserToDocument,
      userId: event.userId,
      actorId: event.actorId,
      teamId: event.teamId,
      documentId: event.documentId,
      membershipId: event.modelId
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DocumentAddUserNotificationsTask;