"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _models = require("../../models");
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
var _GroupMentionedInCommentNotificationsTask = _interopRequireDefault(require("./GroupMentionedInCommentNotificationsTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CommentUpdatedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const isResolving = event.changes?.previous?.resolvedAt === null && event.changes?.attributes?.resolvedAt !== null;
    return isResolving ? await this.handleResolvedComment(event) : await this.handleMentionedComment(event);
  }
  async handleMentionedComment(event) {
    const newMentionIds = event.data?.newMentionIds;
    if (!newMentionIds) {
      return;
    }
    const [document, comment] = await Promise.all([_models.Document.scope("withCollection").findOne({
      where: {
        id: event.documentId
      }
    }), _models.Comment.findByPk(event.modelId)]);
    if (!document || !comment) {
      return;
    }
    const mentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.User
    }).filter(mention => newMentionIds.includes(mention.id));
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
          documentId: document.id,
          commentId: comment.id
        });
        userIdsMentioned.push(mention.modelId);
      }
    }
    const groupMentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.Group
    }).filter(mention => newMentionIds.includes(mention.id));
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
  }
  async handleResolvedComment(event) {
    (0, _invariant.default)(!event.data?.newMentionIds, "newMentionIds should not be present in resolved comment");
    const [document, commentsAndReplies] = await Promise.all([_models.Document.scope("withCollection").findOne({
      where: {
        id: event.documentId
      }
    }), _models.Comment.findAll({
      where: {
        [_sequelize.Op.or]: [{
          id: event.modelId
        }, {
          parentCommentId: event.modelId
        }]
      }
    })]);
    if (!document || !commentsAndReplies) {
      return;
    }
    const userIdsNotified = [];

    // Don't notify resolver
    userIdsNotified.push(event.actorId);
    for (const item of commentsAndReplies) {
      // Mentions:
      const proseCommentData = _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(item.data);
      const mentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(proseCommentData, {
        type: _types.MentionType.User
      });
      const userIds = mentions.map(mention => mention.modelId);

      // Comment author:
      userIds.push(item.createdById);
      for (const userId of userIds) {
        if (userIdsNotified.includes(userId)) {
          continue;
        }
        const user = await _models.User.findByPk(userId);
        if (user && user.subscribedToEventType(_types.NotificationEventType.ResolveComment) && (await (0, _permissions.canUserAccessDocument)(user, document.id))) {
          await _models.Notification.create({
            event: _types.NotificationEventType.ResolveComment,
            userId: user.id,
            actorId: event.actorId,
            teamId: document.teamId,
            documentId: document.id,
            commentId: event.modelId
          });
          userIdsNotified.push(userId);
        }
      }
    }
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CommentUpdatedNotificationsTask;