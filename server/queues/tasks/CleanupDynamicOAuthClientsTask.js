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
/**
 * Deletes dynamically registered OAuth clients (createdById is null) that are
 * either never used (lastActiveAt is null) after 48 hours, or that have been
 * used but inactive for 30 days.
 */
class CleanupDynamicOAuthClientsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    const now = new Date();
    const neverUsedCutoff = (0, _dateFns.subHours)(now, 48);
    const inactiveCutoff = (0, _dateFns.subDays)(now, 30);
    const count = await _models.OAuthClient.unscoped().destroy({
      where: {
        createdById: null,
        [_sequelize.Op.or]: [{
          // Never used and created more than 48 hours ago.
          lastActiveAt: null,
          createdAt: {
            [_sequelize.Op.lt]: neverUsedCutoff
          }
        }, {
          // Used but inactive for more than 30 days.
          lastActiveAt: {
            [_sequelize.Op.lt]: inactiveCutoff
          }
        }]
      },
      limit,
      force: true
    });
    if (count > 0) {
      _Logger.default.info("task", `Deleted dynamic OAuth clients`, {
        count
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
exports.default = CleanupDynamicOAuthClientsTask;