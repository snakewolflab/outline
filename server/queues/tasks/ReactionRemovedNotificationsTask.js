"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _context = require("../../context");
var _database = require("../../storage/database");
var _sequelize = require("sequelize");
class ReactionRemovedNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const {
      emoji
    } = event.data;
    if (event.name !== "comments.remove_reaction") {
      return;
    }
    await _database.sequelize.transaction(async transaction => {
      const user = await _models.User.findByPk(event.actorId, {
        rejectOnEmpty: true,
        transaction
      });
      const notifications = await _models.Notification.findAll({
        lock: {
          level: transaction.LOCK.UPDATE,
          of: _models.Notification
        },
        where: {
          actorId: event.actorId,
          commentId: event.modelId,
          viewedAt: {
            [_sequelize.Op.eq]: null // Only target notifications that haven't been viewed
          },
          event: _types.NotificationEventType.ReactionsCreate,
          data: {
            emoji
          }
        }
      });
      const ctx = (0, _context.createContext)({
        user,
        transaction
      });
      await Promise.all(notifications.map(async notification => notification.updateWithCtx(ctx, {
        archivedAt: new Date()
      })));
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ReactionRemovedNotificationsTask;