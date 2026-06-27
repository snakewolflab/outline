"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _InviteReminderEmail = _interopRequireDefault(require("../../emails/templates/InviteReminderEmail"));
var _models = require("../../models");
var _User = require("../../models/User");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class InviteReminderTask extends _CronTask.CronTask {
  async perform() {
    const users = await _models.User.scope("invited").findAll({
      attributes: ["id"],
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 2),
          [_sequelize.Op.gt]: (0, _dateFns.subDays)(new Date(), 3)
        }
      }
    });
    const userIds = users.map(user => user.id);
    for (const userId of userIds) {
      await _database.sequelize.transaction(async transaction => {
        const user = await _models.User.scope("withTeam").findByPk(userId, {
          lock: {
            level: transaction.LOCK.UPDATE,
            of: _models.User
          },
          transaction
        });
        const invitedBy = user?.invitedById ? await _models.User.findByPk(user?.invitedById, {
          transaction
        }) : undefined;
        if (user && invitedBy && user.getFlag(_User.UserFlag.InviteReminderSent) === 0) {
          await new _InviteReminderEmail.default({
            to: user.email,
            language: user.language,
            name: user.name,
            actorName: invitedBy.name,
            actorEmail: invitedBy.email,
            teamName: user.team.name,
            teamUrl: user.team.url
          }).schedule();
          user.incrementFlag(_User.UserFlag.InviteReminderSent);
          await user.save({
            transaction
          });
        }
      });
    }
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Day
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = InviteReminderTask;