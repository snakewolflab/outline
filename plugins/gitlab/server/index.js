"use strict";

var _time = require("../../../shared/utils/time");
var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _GitLabIssueProvider = require("./GitLabIssueProvider");
var _gitlab = _interopRequireDefault(require("./api/gitlab"));
var _gitlab2 = require("./gitlab");
var _GitLabWebhookTask = _interopRequireDefault(require("./tasks/GitLabWebhookTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_PluginManager.PluginManager.add([{
  ..._plugin.default,
  type: _PluginManager.Hook.API,
  value: _gitlab.default
}, {
  type: _PluginManager.Hook.IssueProvider,
  value: new _GitLabIssueProvider.GitLabIssueProvider()
}, {
  type: _PluginManager.Hook.UnfurlProvider,
  value: {
    unfurl: _gitlab2.GitLab.unfurl,
    cacheExpiry: _time.Minute.seconds
  }
}, {
  type: _PluginManager.Hook.Task,
  value: _GitLabWebhookTask.default
}]);