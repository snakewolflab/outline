"use strict";

var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _notion = _interopRequireDefault(require("./api/notion"));
var _env = _interopRequireDefault(require("./env"));
var _NotionImportsProcessor = require("./processors/NotionImportsProcessor");
var _NotionAPIImportTask = _interopRequireDefault(require("./tasks/NotionAPIImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.NOTION_CLIENT_ID && !!_env.default.NOTION_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.API,
    value: _notion.default
  }, {
    type: _PluginManager.Hook.Processor,
    value: _NotionImportsProcessor.NotionImportsProcessor
  }, {
    type: _PluginManager.Hook.Task,
    value: _NotionAPIImportTask.default
  }]);
}