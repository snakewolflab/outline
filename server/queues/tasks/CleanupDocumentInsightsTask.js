"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _time = require("../../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Number of days of rollup history to retain.
 */
const RETENTION_DAYS = 365;
class CleanupDocumentInsightsTask extends _CronTask.CronTask {
  async perform() {
    // Derive the cutoff in UTC from the database so retention isn't affected
    // by the worker's local timezone. `date` is stored as a UTC DATE.
    const cutoff = (0, _sequelize.literal)(`(NOW() AT TIME ZONE 'UTC')::date - INTERVAL '${RETENTION_DAYS} days'`);
    const deleted = await _models.DocumentInsight.destroy({
      where: {
        date: {
          [_sequelize.Op.lt]: cutoff
        }
      }
    });
    if (deleted > 0) {
      _Logger.default.info("task", `Deleted ${deleted} expired document_insights rows`);
    }
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Day,
      partitionWindow: 30 * _time.Minute.ms
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupDocumentInsightsTask;