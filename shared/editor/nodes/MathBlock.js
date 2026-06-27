"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _prosemirrorState = require("prosemirror-state");
var _tableCell = require("../lib/markdown/tableCell");
var _math = _interopRequireWildcard(require("../rules/math"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
class MathBlock extends _Node.default {
  get name() {
    return "math_block";
  }
  get schema() {
    return _prosemirrorMath.mathSchemaSpec.nodes.math_display;
  }
  get rulePlugins() {
    return [_math.default];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return () => (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(type.create());
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(state.selection.from - 1))).scrollIntoView());
      return true;
    };
  }
  inputRules(_ref2) {
    let {
      type
    } = _ref2;
    return [(0, _prosemirrorMath.makeBlockMathInputRule)(_math.REGEX_BLOCK_MATH_DOLLARS, type)];
  }
  toMarkdown(state, node) {
    // Block content bypasses esc(), so when inside a table cell escape it here
    // so it cannot break out of the column.
    const content = state.inTable ? (0, _tableCell.escapeRawTableCell)(node.textContent) : node.textContent;
    state.write("$$\n");
    state.text(content, false);
    state.ensureNewLine();
    state.write("$$");
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      node: "math_block",
      block: "math_block",
      noCloseToken: true
    };
  }
}
exports.default = MathBlock;