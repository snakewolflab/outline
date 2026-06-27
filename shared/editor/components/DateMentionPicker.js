"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DateMentionPicker;
var PopoverPrimitive = _interopRequireWildcard(require("@radix-ui/react-popover"));
var _reactSlot = require("@radix-ui/react-slot");
var React = _interopRequireWildcard(require("react"));
var _reactI18next = require("react-i18next");
var _reactRemoveScroll = require("react-remove-scroll");
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Calendar = require("../../components/Calendar");
var _styles = require("../../styles");
var _date = require("../../utils/date");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The interactive calendar popover for a date mention. It lives in its own
 * module so that its browser-only dependencies (Radix, react-day-picker) are
 * loaded lazily and stay out of the editor schema graph, which is also imported
 * on the server.
 *
 * @returns the popover wrapping the provided trigger.
 */
function DateMentionPicker(_ref) {
  let {
    selectedDate,
    language,
    onChange,
    children
  } = _ref;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  const [open, setOpen] = React.useState(false);
  const handleSelect = React.useCallback(date => {
    setOpen(false);
    onChange((0, _date.toISODate)(date));
  }, [onChange]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(PopoverPrimitive.Root, {
    open: open,
    onOpenChange: setOpen,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(PopoverPrimitive.Trigger, {
      asChild: true,
      onMouseDown: e => e.stopPropagation(),
      children: children
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(PopoverPrimitive.Portal, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PopoverPrimitive.Content, {
        asChild: true,
        sideOffset: 4,
        align: "start",
        "aria-label": t("Choose a date"),
        onOpenAutoFocus: e => e.preventDefault(),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRemoveScroll.RemoveScroll, {
          as: _reactSlot.Slot,
          allowPinchZoom: true,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DatePopoverContent, {
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Calendar.Calendar, {
              required: true,
              mode: "single",
              selected: selectedDate,
              defaultMonth: selectedDate,
              onSelect: handleSelect,
              locale: (0, _date.dateLocale)(language)
            })
          })
        })
      })
    })]
  });
}
const DatePopoverContent = _styledComponents.default.div.withConfig({
  componentId: "sc-z1fy78-0"
})(["z-index:", ";background:", ";box-shadow:", ";border-radius:8px;outline:none;&[data-state=\"open\"]{animation:fadeIn 150ms ease;}@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}"], _styles.depths.modal, (0, _styles.s)("menuBackground"), (0, _styles.s)("menuShadow"));