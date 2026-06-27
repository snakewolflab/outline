"use strict";

var _time = require("../../../shared/utils/time");
var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _linear = _interopRequireDefault(require("./api/linear"));
var _env = _interopRequireDefault(require("./env"));
var _linear2 = require("./linear");
var _UploadIntegrationLogoTask = _interopRequireDefault(require("../../../server/queues/tasks/UploadIntegrationLogoTask"));
var _uninstall = require("./uninstall");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.LINEAR_CLIENT_ID && !!_env.default.LINEAR_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.API,
    value: _linear.default
  }, {
    type: _PluginManager.Hook.Task,
    value: _UploadIntegrationLogoTask.default
  }, {
    type: _PluginManager.Hook.UnfurlProvider,
    value: {
      unfurl: _linear2.Linear.unfurl,
      cacheExpiry: _time.Minute.seconds
    }
  }, {
    type: _PluginManager.Hook.Uninstall,
    value: _uninstall.uninstall
  }]);
}