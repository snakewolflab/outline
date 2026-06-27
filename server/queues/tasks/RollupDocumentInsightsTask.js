"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _time = require("../../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _DocumentInsight = require("../../models/DocumentInsight");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Number of recent days to (re)compute on each run, in addition to the current
 * day. Reprocessing the most recent days lets late-arriving writes (slow
 * workers, out-of-order event emission) settle into the rollup. The upsert is
 * idempotent.
 */
const RECOMPUTE_DAYS = 2;
class RollupDocumentInsightsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      partition
    } = _ref;
    const [startUuid, endUuid] = this.getPartitionBounds(partition);
    for (let offset = RECOMPUTE_DAYS; offset >= 0; offset--) {
      const periodStart = new Date(Date.now() - offset * _time.Day.ms).toISOString().slice(0, 10);
      const upserted = await _models.DocumentInsight.rollupPeriod({
        periodStart,
        intervalDays: 1,
        period: _DocumentInsight.DocumentInsightPeriod.Day,
        startUuid,
        endUuid
      });
      _Logger.default.info("task", `Rolled up document insights for ${periodStart}`, {
        upserted
      });
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
exports.default = RollupDocumentInsightsTask;