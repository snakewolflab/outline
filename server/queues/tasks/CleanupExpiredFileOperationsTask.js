"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupExpiredFileOperationsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Expiring file operations older than 15 days…`);
    const fileOperations = await _models.FileOperation.unscoped().findAll({
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 15)
        },
        state: {
          [_sequelize.Op.ne]: _types.FileOperationState.Expired
        }
      },
      limit
    });
    await Promise.all(fileOperations.map(fileOperation => fileOperation.expire()));
    _Logger.default.info("task", `Expired ${fileOperations.length} file operations`);
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Hour
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupExpiredFileOperationsTask;