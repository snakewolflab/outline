"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _time = require("../../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _CleanupDeletedTeamTask = _interopRequireDefault(require("./CleanupDeletedTeamTask"));
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupDeletedTeamsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit,
      partition
    } = _ref;
    _Logger.default.info("task", `Permanently destroying upto ${limit} teams older than 30 days…`);
    const teams = await _models.Team.findAll({
      attributes: ["id"],
      where: {
        deletedAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 30)
        },
        ...this.getPartitionWhereClause("id", partition)
      },
      paranoid: false,
      limit
    });
    for (const team of teams) {
      await new _CleanupDeletedTeamTask.default().schedule({
        teamId: team.id
      });
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
exports.default = CleanupDeletedTeamsTask;