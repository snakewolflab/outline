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
var _time = require("../../../shared/utils/time");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupOldEventsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      partition
    } = _ref;
    // TODO: Hardcoded right now, configurable later
    const retentionDays = 365;
    const cutoffDate = (0, _dateFns.subDays)(new Date(), retentionDays);
    const maxEventsPerTask = 100000;
    let totalEventsDeleted = 0;
    try {
      await _models.Event.findAllInBatches({
        attributes: ["id"],
        where: {
          createdAt: {
            [_sequelize.Op.lt]: cutoffDate
          },
          ...this.getPartitionWhereClause("id", partition)
        },
        batchLimit: 1000,
        totalLimit: maxEventsPerTask,
        order: [["createdAt", "ASC"]]
      }, async events => {
        totalEventsDeleted += await _models.Event.destroy({
          where: {
            id: {
              [_sequelize.Op.in]: events.map(event => event.id)
            }
          }
        });
      });
    } finally {
      if (totalEventsDeleted > 0) {
        _Logger.default.info("task", `Deleted old events`, {
          totalEventsDeleted
        });
      }
    }
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
exports.default = CleanupOldEventsTask;