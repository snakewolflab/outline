"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _PluginManager = require("../../utils/PluginManager");
var _fs = require("../../utils/fs");
var _lazyRegistry = require("../../utils/lazyRegistry");
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry of heterogeneous template Props subtypes; BaseEmail<EmailProps> isn't assignable from BaseEmail<Subtype>.
const emails = (0, _lazyRegistry.createLazyRegistry)(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry = {};
  (0, _fs.requireDirectory)(__dirname).forEach(_ref => {
    let [module, id] = _ref;
    if (id === "index") {
      return;
    }
    registry[id] = module.default;
  });
  _PluginManager.PluginManager.getHooks(_PluginManager.Hook.EmailTemplate).forEach(hook => {
    registry[hook.value.name] = hook.value;
  });
  return registry;
});
var _default = exports.default = emails;