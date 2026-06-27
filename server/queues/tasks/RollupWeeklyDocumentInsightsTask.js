"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _time = require("../../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _DocumentInsight = require("../../models/DocumentInsight");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Daily rows older than this threshold are collapsed into weekly rollups to
 * keep the table size manageable. Recent data remains at daily granularity.
 */
const CUTOFF_DAYS = 30;
class RollupWeeklyDocumentInsightsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      partition
    } = _ref;
    const [startUuid, endUuid] = this.getPartitionBounds(partition);

    // Find ISO week starts (Monday) whose Sunday end is older than the cutoff
    // and still have daily rows inside this partition. Postgres `date_trunc`
    // uses ISO weeks, so the result is always a Monday. Join to documents and
    // filter out soft-deleted ones so we stay consistent with rollupPeriod —
    // otherwise we'd delete daily rows it didn't replace. The `date <` bound
    // is implied by the `date_trunc` filter but stated separately so the
    // planner can short-circuit via the (documentId, date, period) index
    // before evaluating the truncation.
    const weeks = await _database.sequelize.query(`
      SELECT DISTINCT date_trunc('week', di.date)::date AS "weekStart"
      FROM document_insights di
      INNER JOIN documents d
        ON d.id = di."documentId"
        AND d."deletedAt" IS NULL
      WHERE di.period = 'day'
        AND di."documentId" >= :startUuid::uuid
        AND di."documentId" <= :endUuid::uuid
        AND di.date < (NOW() AT TIME ZONE 'UTC')::date - (:cutoffDays::int * INTERVAL '1 day')
        AND date_trunc('week', di.date) < (NOW() AT TIME ZONE 'UTC')::date - ((:cutoffDays::int + 6) * INTERVAL '1 day')
      ORDER BY "weekStart" ASC
      `, {
      replacements: {
        startUuid,
        endUuid,
        cutoffDays: CUTOFF_DAYS
      },
      type: _sequelize.QueryTypes.SELECT
    });
    for (const {
      weekStart
    } of weeks) {
      const upserted = await _models.DocumentInsight.rollupPeriod({
        periodStart: weekStart,
        intervalDays: 7,
        period: _DocumentInsight.DocumentInsightPeriod.Week,
        startUuid,
        endUuid
      });
      await _database.sequelize.query(`
        DELETE FROM document_insights di
        USING documents d
        WHERE d.id = di."documentId"
          AND d."deletedAt" IS NULL
          AND di.period = 'day'
          AND di."documentId" >= :startUuid::uuid
          AND di."documentId" <= :endUuid::uuid
          AND di.date >= :weekStart::date
          AND di.date < :weekStart::date + INTERVAL '7 days'
        `, {
        replacements: {
          startUuid,
          endUuid,
          weekStart
        },
        type: _sequelize.QueryTypes.DELETE
      });
      _Logger.default.info("task", `Rolled up document insights week ${weekStart}`, {
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
exports.default = RollupWeeklyDocumentInsightsTask;