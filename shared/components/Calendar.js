"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Calendar = Calendar;
var React = _interopRequireWildcard(require("react"));
var _reactDayPicker = require("react-day-picker");
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A themed calendar built on react-day-picker. It is styled from scratch (the
 * library's base stylesheet is intentionally not relied upon) so that it looks
 * consistent everywhere it is used. Outside (previous/next month) days are
 * shown de-emphasised, the selected day is a solid accent-filled circle, and
 * today is highlighted with the accent colour.
 *
 * @param props the underlying react-day-picker props; `showOutsideDays` and
 * `fixedWeeks` default to true but may be overridden.
 * @returns the rendered calendar.
 */
function Calendar(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Wrapper, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactDayPicker.DayPicker, {
      showOutsideDays: true,
      fixedWeeks: true,
      ...props
    })
  });
}
const Wrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-d3yux9-0"
})(["padding:12px;color:", ";.rdp{margin:0;}.rdp-vhidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0;appearance:none;}.rdp-month{width:100%;}.rdp-caption{display:flex;align-items:center;justify-content:space-between;padding:0 2px 8px;}.rdp-caption_label{font-size:14px;font-weight:600;color:", ";}.rdp-nav{display:flex;gap:2px;}.rdp-nav_button{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;background:none;border-radius:4px;color:", ";cursor:pointer;transition:background 100ms ease;&:hover{background:", ";}}.rdp-nav_icon{width:16px;height:16px;}.rdp-table{border-collapse:collapse;width:100%;}.rdp-head_cell{font-size:12px;font-weight:500;text-transform:none;color:", ";padding:4px 0;text-align:center;}.rdp-cell{padding:1px;text-align:center;}.rdp-day{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:0;background:none;border-radius:50%;font-family:inherit;font-size:13px;font-variant-numeric:tabular-nums;color:", ";cursor:pointer;transition:background 100ms ease;&:hover:not([disabled]):not(.rdp-day_selected){background:", ";}&:focus-visible:not([disabled]){outline:2px solid ", ";outline-offset:-2px;}}.rdp-day_today:not(.rdp-day_selected){font-weight:700;color:", ";}.rdp-day_outside{color:", ";opacity:0.5;}.rdp-day[disabled]{color:", ";opacity:0.4;cursor:default;}.rdp-day_selected,.rdp-day_selected:hover,.rdp-day_selected:focus-visible{background:", ";color:", ";font-weight:500;opacity:1;}"], (0, _styles.s)("text"), (0, _styles.s)("text"), (0, _styles.s)("textSecondary"), (0, _styles.s)("listItemHoverBackground"), (0, _styles.s)("textTertiary"), (0, _styles.s)("text"), (0, _styles.s)("listItemHoverBackground"), (0, _styles.s)("accent"), (0, _styles.s)("accent"), (0, _styles.s)("textTertiary"), (0, _styles.s)("textTertiary"), (0, _styles.s)("accent"), (0, _styles.s)("accentText"));