"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../../shared/types");
var _BaseTask = require("../../../../server/queues/tasks/base/BaseTask");
var _PluginManager = require("../../../../server/utils/PluginManager");
class GitLabWebhookTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      headers,
      payload
    } = _ref;
    const plugins = _PluginManager.PluginManager.getHooks(_PluginManager.Hook.IssueProvider);
    const plugin = plugins.find(p => p.value.service === _types.IntegrationService.GitLab);
    if (!plugin) {
      return;
    }
    await plugin.value.handleWebhook({
      headers,
      payload
    });
  }
}
exports.default = GitLabWebhookTask;