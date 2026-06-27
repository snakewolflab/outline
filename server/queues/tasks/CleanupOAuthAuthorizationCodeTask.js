"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupOAuthAuthorizationCodeTask extends _CronTask.CronTask {
  async perform() {
    _Logger.default.info("task", `Deleting OAuth authorization codes older than one month…`);
    const count = await _models.OAuthAuthorizationCode.destroy({
      where: {
        expiresAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subMonths)(new Date(), 1)
        }
      }
    });
    _Logger.default.info("task", `${count} expired OAuth authorization codes deleted.`);
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
exports.default = CleanupOAuthAuthorizationCodeTask;