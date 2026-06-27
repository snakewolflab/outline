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
/**
 * A task that deletes the import_tasks for old imports which are completed, errored (or) canceled.
 */
class CleanupOldImportsTask extends _CronTask.CronTask {
  async perform() {
    // TODO: Hardcoded right now, configurable later
    const retentionDays = 1;
    const cutoffDate = (0, _dateFns.subDays)(new Date(), retentionDays);
    const maxImportsPerTask = 1000;
    let totalTasksDeleted = 0;
    try {
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      await _models.Import.findAllInBatches({
        attributes: ["id"],
        where: {
          state: [_types.ImportState.Completed, _types.ImportState.Errored, _types.ImportState.Canceled],
          createdAt: {
            [_sequelize.Op.lt]: cutoffDate
          }
        },
        order: [["createdAt", "ASC"], ["id", "ASC"]],
        batchLimit: 50,
        totalLimit: maxImportsPerTask,
        paranoid: false
      }, async imports => {
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
        await _models.ImportTask.findAllInBatches({
          attributes: ["id"],
          where: {
            importId: imports.map(importModel => importModel.id)
          },
          order: [["createdAt", "ASC"], ["id", "ASC"]],
          batchLimit: 1000
        }, async importTasks => {
          totalTasksDeleted += await _models.ImportTask.destroy({
            where: {
              id: importTasks.map(importTask => importTask.id)
            }
          });
        });
      });
    } finally {
      if (totalTasksDeleted > 0) {
        _Logger.default.info("task", `Deleted old import_tasks`, {
          totalTasksDeleted
        });
      }
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
exports.default = CleanupOldImportsTask;