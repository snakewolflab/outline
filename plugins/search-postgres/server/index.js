"use strict";

var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _PostgresSearchProvider = _interopRequireDefault(require("./PostgresSearchProvider"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const provider = new _PostgresSearchProvider.default();
_PluginManager.PluginManager.add([{
  ..._plugin.default,
  type: _PluginManager.Hook.SearchProvider,
  value: provider
}]);