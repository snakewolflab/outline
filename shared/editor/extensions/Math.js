"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMathView = createMathView;
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _browser = require("../../utils/browser");
var _prosemirrorState = require("prosemirror-state");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const MATH_PLUGIN_KEY = new _prosemirrorState.PluginKey("prosemirror-math");
function createMathView(displayMode) {
  return (node, view, getPos) => {
    if (!_browser.isNode) {
      // dynamically load katex styles and fonts
      void Promise.resolve().then(() => _interopRequireWildcard(require("katex/dist/katex.min.css")));
    }
    const pluginState = MATH_PLUGIN_KEY.getState(view.state);
    if (!pluginState) {
      throw new Error("no math plugin!");
    }
    const nodeViews = pluginState.activeNodeViews;

    // set up NodeView
    const nodeView = new _prosemirrorMath.MathView(node, view, getPos, {
      katexOptions: {
        displayMode,
        output: "html",
        macros: pluginState.macros
      }
    }, MATH_PLUGIN_KEY, () => {
      nodeViews.splice(nodeViews.indexOf(nodeView));
    });
    nodeViews.push(nodeView);
    return nodeView;
  };
}
const mathPluginSpec = {
  key: MATH_PLUGIN_KEY,
  state: {
    init() {
      return {
        macros: {},
        activeNodeViews: [],
        prevCursorPos: 0
      };
    },
    apply(tr, value, oldState) {
      return {
        activeNodeViews: value.activeNodeViews,
        macros: value.macros,
        prevCursorPos: oldState.selection.from
      };
    }
  },
  props: {
    nodeViews: {
      math_inline: createMathView(false),
      math_block: createMathView(true)
    }
  }
};
var _default = exports.default = new _prosemirrorState.Plugin(mathPluginSpec);