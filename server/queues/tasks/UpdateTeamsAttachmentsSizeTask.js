"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
var _UpdateTeamAttachmentsSizeTask = _interopRequireDefault(require("./UpdateTeamAttachmentsSizeTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class UpdateTeamsAttachmentsSizeTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Recalculating attachment sizes for upto ${limit} teams…`);

    // Find unique attachment teamIds created in the last day, update only
    // those teams' approximate attachment sizes
    await _models.Attachment.findAllInBatches({
      attributes: [[_database.sequelize.fn("DISTINCT", _database.sequelize.col("teamId")), "teamId"]],
      where: {
        createdAt: {
          [_sequelize.Op.gt]: (0, _dateFns.subDays)(new Date(), 1)
        }
      },
      batchLimit: 100,
      raw: true
    }, async rows => {
      const teamIds = rows.map(row => row.teamId);
      for (const teamId of teamIds) {
        await new _UpdateTeamAttachmentsSizeTask.default().schedule({
          teamId
        });
      }
    });
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
exports.default = UpdateTeamsAttachmentsSizeTask;