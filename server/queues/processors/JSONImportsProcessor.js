"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _JSONAPIImportTask = _interopRequireDefault(require("../tasks/JSONAPIImportTask"));
var _ImportsProcessor = _interopRequireDefault(require("./ImportsProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class JSONImportsProcessor extends _ImportsProcessor.default {
  canProcess(importModel) {
    return importModel.service === _types.IntegrationService.JSON;
  }
  getInitialPhase() {
    return _types.ImportTaskPhase.Bootstrap;
  }
  async buildTasksInput(importModel, _transaction) {
    if (!importModel.scratch?.storageKey) {
      throw new Error("JSON import is missing scratch.storageKey for the bootstrap phase");
    }
    return [{
      externalId: importModel.input[0].externalId
    }];
  }
  async scheduleTask(importTask) {
    await new _JSONAPIImportTask.default().schedule({
      importTaskId: importTask.id
    });
  }
}
exports.default = JSONImportsProcessor;