"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _documentPermanentDeleter = _interopRequireDefault(require("../../commands/documentPermanentDeleter"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _time = require("../../../shared/utils/time");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupDeletedDocumentsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit,
      partition
    } = _ref;
    _Logger.default.info("task", `Permanently destroying upto ${limit} documents older than 30 days…`);
    const documents = await _models.Document.unscoped().findAll({
      attributes: ["id", "teamId", "deletedAt", "content", "state", "text"],
      where: {
        deletedAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 30)
        },
        ...this.getPartitionWhereClause("id", partition)
      },
      paranoid: false,
      limit
    });
    const countDeletedDocument = await (0, _documentPermanentDeleter.default)(documents);
    _Logger.default.info("task", `Destroyed ${countDeletedDocument} documents`);
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Hour,
      partitionWindow: 15 * _time.Minute.ms
    };
  }
}
exports.default = CleanupDeletedDocumentsTask;