"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _PluginManager = require("./PluginManager");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Manages selection and caching of the active search provider based on the
 * `SEARCH_PROVIDER` environment variable.
 */
class SearchProviderManager {
  /**
   * Returns the active search provider. The provider is determined by matching
   * `SEARCH_PROVIDER` env var against registered `Hook.SearchProvider` plugins.
   *
   * @returns the active search provider instance.
   * @throws if no matching provider is found.
   */
  static getProvider() {
    if (this.cachedProvider) {
      return this.cachedProvider;
    }
    const providerId = _env.default.SEARCH_PROVIDER;
    const plugins = _PluginManager.PluginManager.getHooks(_PluginManager.Hook.SearchProvider);
    for (const plugin of plugins) {
      if (plugin.value.id === providerId) {
        this.cachedProvider = plugin.value;
        _Logger.default.debug("plugins", `Using search provider: ${plugin.value.id}`);
        return this.cachedProvider;
      }
    }
    throw new Error(`Search provider "${providerId}" not found. Available providers: ${plugins.map(p => p.value.id).join(", ")}`);
  }

  /**
   * Reset the cached provider. Useful for testing.
   */
  static reset() {
    this.cachedProvider = undefined;
  }
}
exports.default = SearchProviderManager;
_defineProperty(SearchProviderManager, "cachedProvider", void 0);