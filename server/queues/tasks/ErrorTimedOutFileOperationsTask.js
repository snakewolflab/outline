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
class ErrorTimedOutFileOperationsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Error file operations running longer than 12 hours…`);
    const fileOperations = await _models.FileOperation.unscoped().findAll({
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subHours)(new Date(), 12)
        },
        [_sequelize.Op.or]: [{
          state: _types.FileOperationState.Creating
        }, {
          state: _types.FileOperationState.Uploading
        }]
      },
      limit
    });
    await Promise.all(fileOperations.map(async fileOperation => {
      fileOperation.state = _types.FileOperationState.Error;
      fileOperation.error = "Timed out";
      await fileOperation.save({
        hooks: false
      });
    }));
    _Logger.default.info("task", `Updated ${fileOperations.length} file operations`);
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
exports.default = ErrorTimedOutFileOperationsTask;