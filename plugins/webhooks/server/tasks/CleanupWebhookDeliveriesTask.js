"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _models = require("../../../../server/models");
var _BaseTask = require("../../../../server/queues/tasks/base/BaseTask");
var _CronTask = require("../../../../server/queues/tasks/base/CronTask");
var _time = require("../../../../shared/utils/time");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupWebhookDeliveriesTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      partition
    } = _ref;
    _Logger.default.info("task", `Deleting WebhookDeliveries older than one week…`);
    const count = await _models.WebhookDelivery.unscoped().destroy({
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 7)
        },
        ...this.getPartitionWhereClause("id", partition)
      }
    });
    _Logger.default.info("task", `${count} old WebhookDeliveries deleted.`);
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Day,
      partitionWindow: _time.Hour.ms
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupWebhookDeliveriesTask;