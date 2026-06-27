"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _Math = _interopRequireDefault(require("../extensions/Math"));
var _math = _interopRequireWildcard(require("../rules/math"));
var _Node = _interopRequireDefault(require("./Node"));
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _isInCode = require("../queries/isInCode");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Math extends _Node.default {
  get name() {
    return "math_inline";
  }
  get schema() {
    return _prosemirrorMath.mathSchemaSpec.nodes.math_inline;
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return () => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    };
  }
  inputRules(_ref2) {
    let {
      schema
    } = _ref2;
    return [new _prosemirrorInputrules.InputRule(_math.REGEX_INLINE_MATH_DOLLARS, (state, match, start, end) => {
      if ((0, _isInCode.isInCode)(state)) {
        return null;
      }
      let $start = state.doc.resolve(start);
      let index = $start.index();
      let $end = state.doc.resolve(end);
      // check if replacement valid
      if (!$start.parent.canReplaceWith(index, $end.index(), schema.nodes.math_inline)) {
        return null;
      }
      // perform replacement
      return state.tr.replaceRangeWith(start, end, schema.nodes.math_inline.create(undefined, schema.nodes.math_inline.schema.text(match[1])));
    })];
  }
  keys(_ref3) {
    let {
      type
    } = _ref3;
    return {
      "Mod-Space": (0, _prosemirrorMath.insertMathCmd)(type),
      Backspace: _prosemirrorMath.mathBackspaceCmd
    };
  }
  get plugins() {
    return [_Math.default];
  }
  get rulePlugins() {
    return [_math.default];
  }
  toMarkdown(state, node) {
    state.write("$");
    state.text(node.textContent, false);
    state.write("$");
  }
  parseMarkdown() {
    return {
      node: "math_inline",
      block: "math_inline",
      noCloseToken: true
    };
  }
}
exports.default = Math;