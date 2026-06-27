"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotionImportsProcessor = void 0;
var _types = require("../../../../shared/types");
var _models = require("../../../../server/models");
var _ImportsProcessor = _interopRequireDefault(require("../../../../server/queues/processors/ImportsProcessor"));
var _notion = require("../notion");
var _NotionAPIImportTask = _interopRequireDefault(require("../tasks/NotionAPIImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class NotionImportsProcessor extends _ImportsProcessor.default {
  /**
   * Determine whether this is a "Notion" import.
   *
   * @param importModel Import model associated with the import.
   * @returns boolean.
   */
  canProcess(importModel) {
    return importModel.service === _types.IntegrationService.Notion;
  }

  /**
   * Build task inputs which will be used for `NotionAPIImportTask`s.
   *
   * @param importInput Array of root externalId and associated info which were used to create the import.
   * @returns `NotionImportTaskInput`.
   */
  async buildTasksInput(importModel, transaction) {
    if (!importModel.integrationId) {
      throw new Error("Notion import is missing integrationId");
    }
    const integration = await _models.Integration.scope("withAuthentication").findByPk(importModel.integrationId, {
      rejectOnEmpty: true
    });
    const notion = new _notion.NotionClient(integration.authentication.token);
    const rootPages = await notion.fetchRootPages();

    // App will send the default permission in an array with single item.
    const defaultPermission = importModel.input[0].permission;

    // TODO: This update can be deleted when we receive the page info + permission from app.
    const importInput = rootPages.map(page => ({
      type: page.type,
      externalId: page.id,
      permission: defaultPermission
    }));
    importModel.input = importInput;
    await importModel.save({
      transaction
    });
    return rootPages.map(page => ({
      type: page.type,
      externalId: page.id
    }));
  }

  /**
   * Schedule the first `NotionAPIImportTask` for the import.
   *
   * @param importTask ImportTask model associated with the `NotionAPIImportTask`.
   * @returns Promise that resolves when the task is scheduled.
   */
  async scheduleTask(importTask) {
    await new _NotionAPIImportTask.default().schedule({
      importTaskId: importTask.id
    });
  }
}
exports.NotionImportsProcessor = NotionImportsProcessor;