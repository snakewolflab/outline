"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _models = require("../../models");
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
class GroupMentionedInCommentNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const {
      groupId,
      actorId
    } = event.data;

    // Defensive check: ensure group has mentions enabled.
    // This is also checked in the parent task, but we verify here
    // for resilience in case this task is scheduled directly.
    const groupModel = await _models.Group.findByPk(groupId);
    if (groupModel?.disableMentions) {
      return;
    }

    // Process group members in batches for scalability
    await _models.GroupUser.findAllInBatches({
      where: {
        groupId,
        userId: {
          [_sequelize.Op.ne]: actorId
        }
      },
      order: [["permission", "ASC"]],
      batchLimit: 10
    }, async groupUsers => {
      // Batch fetch all users to reduce database queries
      const userIds = groupUsers.map(gu => gu.userId);
      const users = await _models.User.findAll({
        where: {
          id: userIds
        }
      });

      // Create a map for quick user lookup
      const userMap = new Map(users.map(u => [u.id, u]));

      // Process notifications for this batch (limited to 10 concurrent operations
      // by the batch size to avoid overwhelming the database connection pool)
      await Promise.all(groupUsers.map(async groupUser => {
        const recipient = userMap.get(groupUser.userId);
        if (recipient && recipient.subscribedToEventType(_types.NotificationEventType.GroupMentionedInComment) && (await (0, _permissions.canUserAccessDocument)(recipient, event.documentId))) {
          await _models.Notification.create({
            event: _types.NotificationEventType.GroupMentionedInComment,
            groupId,
            userId: recipient.id,
            actorId,
            teamId: event.teamId,
            documentId: event.documentId,
            commentId: event.modelId
          });
        }
      }));
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = GroupMentionedInCommentNotificationsTask;