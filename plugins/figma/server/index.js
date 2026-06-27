"use strict";

var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _figma = _interopRequireDefault(require("./api/figma"));
var _env = _interopRequireDefault(require("./env"));
var _figma2 = require("./figma");
var _time = require("../../../shared/utils/time");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.FIGMA_CLIENT_ID && !!_env.default.FIGMA_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.API,
    value: _figma.default
  }, {
    type: _PluginManager.Hook.UnfurlProvider,
    value: {
      unfurl: _figma2.Figma.unfurl,
      cacheExpiry: 10 * _time.Minute.seconds
    }
  }]);
}