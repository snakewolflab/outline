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
var _time = require("../../../shared/utils/time");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupOldNotificationsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      partition
    } = _ref;
    _Logger.default.info("task", `Permanently destroying old notifications…`);
    let count;
    count = await _models.Notification.destroy({
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subMonths)(new Date(), 12)
        },
        ...this.getPartitionWhereClause("id", partition)
      }
    });
    _Logger.default.info("task", `Destroyed ${count} notifications older than 12 months…`);
    count = await _models.Notification.destroy({
      where: {
        viewedAt: {
          [_sequelize.Op.ne]: null
        },
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subMonths)(new Date(), 6)
        },
        ...this.getPartitionWhereClause("id", partition)
      }
    });
    _Logger.default.info("task", `Destroyed ${count} viewed notifications older than 6 months…`);
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Hour,
      partitionWindow: 15 * _time.Minute.ms
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupOldNotificationsTask;