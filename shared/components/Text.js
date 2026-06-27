"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _styles = require("../styles");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Use this component for all interface text that should not be selectable
 * by the user, this is the majority of UI text explainers, notes, headings.
 */
const Text = _styledComponents.default.span.withConfig({
  componentId: "sc-1bsum4f-0"
})(["margin-top:0;text-align:", ";color:", ";font-size:", ";", " font-style:", ";font-family:", ";white-space:normal;user-select:", ";", ""], props => props.dir ? props.dir : "inherit", props => props.type === "secondary" ? props.theme.textSecondary : props.type === "tertiary" ? props.theme.textTertiary : props.type === "danger" ? props.theme.brand.red : props.theme.text, props => props.size === "xlarge" ? "26px" : props.size === "large" ? "18px" : props.size === "medium" ? "16px" : props.size === "small" ? "14px" : props.size === "xsmall" ? "13px" : "inherit", props => props.weight && (0, _styledComponents.css)(["font-weight:", ";"], props.weight === "xbold" ? 600 : props.weight === "bold" ? 500 : props.weight === "normal" ? 400 : "inherit"), props => props.italic ? "italic" : "normal", props => props.monospace ? props.theme.fontFamilyMono : "inherit", props => props.selectable ? "text" : "none", props => props.ellipsis && (0, _styles.ellipsis)());
var _default = exports.default = Text;