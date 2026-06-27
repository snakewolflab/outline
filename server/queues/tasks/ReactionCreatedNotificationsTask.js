"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
class ReactionCreatedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const {
      emoji
    } = event.data;

    // Only handle add_reaction events, not remove_reaction
    if (event.name !== "comments.add_reaction") {
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

    // Get the user who reacted (the actor)
    const actor = await _models.User.findByPk(event.actorId);
    if (!actor) {
      return;
    }

    // Get the comment author (the recipient of the notification)
    const recipient = await _models.User.findByPk(comment.createdById);
    if (!recipient) {
      return;
    }

    // Don't notify if the user reacted to their own comment
    if (actor.id === recipient.id) {
      return;
    }

    // Check if the comment author has this notification type enabled
    if (!recipient.subscribedToEventType(_types.NotificationEventType.ReactionsCreate)) {
      return;
    }

    // Check if the comment author can access the document
    if (!(await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
      return;
    }
    const existing = await _models.Notification.findOne({
      where: {
        event: _types.NotificationEventType.ReactionsCreate,
        userId: recipient.id,
        commentId: comment.id
      }
    });
    if (existing) {
      // If a notification already exists for this reaction, update it
      // as we have a unique constraint on userId, commentId, and event.
      await existing.update({
        viewedAt: null,
        archivedAt: null,
        actorId: actor.id,
        data: {
          emoji
        }
      });
      return;
    }

    // Create the notification
    await _models.Notification.create({
      event: _types.NotificationEventType.ReactionsCreate,
      userId: recipient.id,
      actorId: actor.id,
      teamId: document.teamId,
      commentId: comment.id,
      documentId: document.id,
      data: {
        emoji
      }
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ReactionCreatedNotificationsTask;