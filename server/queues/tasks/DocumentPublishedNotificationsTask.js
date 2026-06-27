"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _subscriptionCreator = require("../../commands/subscriptionCreator");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _NotificationHelper = _interopRequireDefault(require("../../models/helpers/NotificationHelper"));
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentPublishedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const document = await _models.Document.findByPk(event.documentId, {
      includeState: true
    });
    if (!document) {
      return;
    }
    await (0, _subscriptionCreator.createSubscriptionsForDocument)(document, event);

    // Send notifications to mentioned users first
    const mentions = _DocumentHelper.DocumentHelper.parseMentions(document, {
      type: _types.MentionType.User
    });
    const userIdsProcessed = new Set();
    const userIdsMentioned = [];
    const usersToSubscribe = [];
    for (const mention of mentions) {
      if (userIdsProcessed.has(mention.modelId)) {
        continue;
      }
      userIdsProcessed.add(mention.modelId);
      const recipient = await _models.User.findByPk(mention.modelId);
      if (!recipient || recipient.id === mention.actorId || !(await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
        continue;
      }
      usersToSubscribe.push(recipient);
      if (recipient.subscribedToEventType(_types.NotificationEventType.MentionedInDocument)) {
        await _models.Notification.create({
          event: _types.NotificationEventType.MentionedInDocument,
          userId: recipient.id,
          actorId: mention.actorId,
          teamId: document.teamId,
          documentId: document.id
        });
        userIdsMentioned.push(recipient.id);
      }
    }
    await (0, _subscriptionCreator.subscribeUsersToDocument)(usersToSubscribe, document, event);

    // send notifications to users in mentioned groups
    const groupMentions = _DocumentHelper.DocumentHelper.parseMentions(document, {
      type: _types.MentionType.Group
    });
    const mentionedGroup = [];
    for (const group of groupMentions) {
      if (mentionedGroup.includes(group.modelId)) {
        continue;
      }

      // Check if the group has mentions disabled
      const groupModel = await _models.Group.findByPk(group.modelId);
      if (groupModel?.disableMentions) {
        continue;
      }
      const usersFromMentionedGroup = await _models.GroupUser.findAll({
        where: {
          groupId: group.modelId
        },
        order: [["permission", "ASC"]]
      });
      const mentionedUser = [];
      for (const user of usersFromMentionedGroup) {
        if (mentionedUser.includes(user.userId)) {
          continue;
        }
        const recipient = await _models.User.findByPk(user.userId);
        if (recipient && recipient.id !== group.actorId && recipient.subscribedToEventType(_types.NotificationEventType.GroupMentionedInDocument) && (await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
          await _models.Notification.create({
            event: _types.NotificationEventType.GroupMentionedInDocument,
            groupId: group.modelId,
            userId: recipient.id,
            actorId: group.actorId,
            teamId: document.teamId,
            documentId: document.id
          });
          mentionedUser.push(user.userId);
        }
      }
      mentionedGroup.push(group.modelId);
    }
    const recipients = (await _NotificationHelper.default.getDocumentNotificationRecipients({
      document,
      notificationType: _types.NotificationEventType.PublishDocument,
      actorId: document.lastModifiedById
    })).filter(recipient => !userIdsMentioned.includes(recipient.id));
    for (const recipient of recipients) {
      await _models.Notification.create({
        event: _types.NotificationEventType.PublishDocument,
        userId: recipient.id,
        actorId: document.updatedBy.id,
        teamId: document.teamId,
        documentId: document.id
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DocumentPublishedNotificationsTask;