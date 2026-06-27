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
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that moves the stuck imports to errored state.
 */
class ErrorTimedOutImportsTask extends _CronTask.CronTask {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    // TODO: Hardcoded right now, configurable later
    const thresholdHours = 24;
    const cutOffTime = (0, _dateFns.subHours)(new Date(), thresholdHours);
    const importsErrored = {};
    try {
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      await _models.ImportTask.findAllInBatches({
        where: {
          state: [_types.ImportTaskState.Created, _types.ImportTaskState.InProgress],
          createdAt: {
            [_sequelize.Op.lt]: cutOffTime
          }
        },
        include: [{
          model: _models.Import.unscoped(),
          as: "import",
          required: true
        }],
        order: [["createdAt", "ASC"], ["id", "ASC"]],
        batchLimit: 1000,
        totalLimit: limit
      }, async importTasks => {
        for (const importTask of importTasks) {
          const associatedImport = importTask.import;
          if (associatedImport.state === _types.ImportState.Canceled) {
            continue; // import_tasks for a canceled import are not considered stuck.
          }
          await _database.sequelize.transaction(async transaction => {
            importTask.state = _types.ImportTaskState.Errored;
            importTask.error = "Timed out";
            await importTask.save({
              transaction
            });

            // this import could have been seen before in another import_task.
            if (!importsErrored[associatedImport.id]) {
              associatedImport.state = _types.ImportState.Errored;
              associatedImport.error = "Timed out";
              await associatedImport.save({
                transaction
              });
              importsErrored[associatedImport.id] = true;
            }
          });
        }
      });
    } finally {
      const totalImportsErrored = Object.keys(importsErrored).length;
      if (totalImportsErrored > 0) {
        _Logger.default.info("task", `Updated ${totalImportsErrored} imports to error status`);
      }
    }
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
exports.default = ErrorTimedOutImportsTask;