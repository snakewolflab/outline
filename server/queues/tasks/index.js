"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _PluginManager = require("../../utils/PluginManager");
var _fs = require("../../utils/fs");
var _lazyRegistry = require("../../utils/lazyRegistry");
const tasks = (0, _lazyRegistry.createLazyRegistry)(() => {
  const tasks = {};
  (0, _fs.requireDirectory)(__dirname).forEach(_ref => {
    let [module, id] = _ref;
    if (id === "index") {
      return;
    }
    tasks[id] = module.default;
  });
  _PluginManager.PluginManager.getHooks(_PluginManager.Hook.Task).forEach(hook => {
    tasks[hook.value.name] = hook.value;
  });
  return tasks;
});
var _default = exports.default = tasks;