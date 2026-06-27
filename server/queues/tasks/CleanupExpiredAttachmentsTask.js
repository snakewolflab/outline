"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupExpiredAttachmentsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Deleting expired attachments…`);
    const attachments = await _models.Attachment.unscoped().findAll({
      where: {
        expiresAt: {
          [_sequelize.Op.lt]: new Date()
        }
      },
      limit
    });
    await Promise.all(attachments.map(attachment => attachment.destroy()));
    _Logger.default.info("task", `Removed ${attachments.length} attachments`);
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
exports.default = CleanupExpiredAttachmentsTask;