"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _subscriptionCreator = _interopRequireDefault(require("../../commands/subscriptionCreator"));
var _context = require("../../context");
var _models = require("../../models");
var _NotificationHelper = _interopRequireDefault(require("../../models/helpers/NotificationHelper"));
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _database = require("../../storage/database");
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
var _GroupMentionedInCommentNotificationsTask = _interopRequireDefault(require("./GroupMentionedInCommentNotificationsTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CommentCreatedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const [document, comment] = await Promise.all([_models.Document.scope("withCollection").findOne({
      where: {
        id: event.documentId
      }
    }), _models.Comment.findByPk(event.modelId)]);
    if (!document || !comment) {
      return;
    }

    // Commenting on a doc automatically creates a subscription to the doc
    // if they haven't previously had one.
    await _database.sequelize.transaction(async transaction => {
      await (0, _subscriptionCreator.default)({
        ctx: (0, _context.createContext)({
          user: comment.createdBy,
          authType: event.authType,
          ip: event.ip,
          transaction
        }),
        documentId: document.id,
        event: _types.SubscriptionType.Document,
        resubscribe: false
      });
    });
    const mentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.User
    });
    const userIdsMentioned = [];
    for (const mention of mentions) {
      if (userIdsMentioned.includes(mention.modelId)) {
        continue;
      }
      const recipient = await _models.User.findByPk(mention.modelId);
      if (mention.actorId && recipient && recipient.id !== mention.actorId && recipient.subscribedToEventType(_types.NotificationEventType.MentionedInComment) && (await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
        await _models.Notification.create({
          event: _types.NotificationEventType.MentionedInComment,
          userId: recipient.id,
          actorId: mention.actorId,
          teamId: document.teamId,
          commentId: comment.id,
          documentId: document.id
        });
        userIdsMentioned.push(recipient.id);
      }
    }

    // send notifications to users in mentioned groups
    const groupMentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
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

      // Schedule a separate task to handle group member notifications
      await new _GroupMentionedInCommentNotificationsTask.default().schedule({
        ...event,
        data: {
          groupId: group.modelId,
          actorId: group.actorId ?? event.actorId
        }
      });
      mentionedGroup.push(group.modelId);
    }
    const recipients = (await _NotificationHelper.default.getCommentNotificationRecipients(document, comment, comment.createdById)).filter(recipient => !userIdsMentioned.includes(recipient.id));
    await _database.sequelize.transaction(async transaction => {
      for (const recipient of recipients) {
        await _models.Notification.create({
          event: _types.NotificationEventType.CreateComment,
          userId: recipient.id,
          actorId: comment.createdById,
          teamId: document.teamId,
          commentId: comment.id,
          documentId: document.id
        }, {
          transaction
        });
      }
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CommentCreatedNotificationsTask;