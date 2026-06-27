"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../models");
var _database = require("../../storage/database");
var _PluginManager = require("../../utils/PluginManager");
var _BaseTask = require("./base/BaseTask");
class CacheIssueSourcesTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      integrationId
    } = _ref;
    const integration = await _models.Integration.findByPk(integrationId);
    if (!integration) {
      return;
    }
    const plugins = _PluginManager.PluginManager.getHooks(_PluginManager.Hook.IssueProvider);
    const plugin = plugins.find(p => p.value.service === integration.service);
    if (!plugin) {
      return;
    }
    const sources = await plugin.value.fetchSources(integration);
    await _database.sequelize.transaction(async transaction => {
      await integration.reload({
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      integration.issueSources = sources;
      await integration.save({
        transaction
      });
    });
  }
}
exports.default = CacheIssueSourcesTask;