"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EventBoundary = void 0;
var React = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props for the EventBoundary component.
 */

/**
 * EventBoundary is a component that prevents events from propagating to parent elements.
 * This is useful for preventing clicks or other interactions from bubbling up the DOM tree.
 *
 * @param props - the properties of the component.
 * @return a React component that captures events.
 */
const EventBoundary = _ref => {
  let {
    as,
    children,
    className,
    captureEvents = "all",
    ...rest
  } = _ref;
  const Component = as || "span";
  const stopEvent = React.useCallback(event => {
    event.stopPropagation();
  }, []);
  const eventHandlers = {};
  if (captureEvents === "all" || captureEvents === "keyboard") {
    eventHandlers.onKeyDown = stopEvent;
    eventHandlers.onKeyUp = stopEvent;
  }
  if (captureEvents === "all" || captureEvents === "mouse") {
    eventHandlers.onMouseDown = stopEvent;
    eventHandlers.onMouseUp = stopEvent;
  }
  if (captureEvents === "all" || captureEvents === "pointer") {
    eventHandlers.onPointerDown = stopEvent;
    eventHandlers.onPointerUp = stopEvent;
  }
  if (captureEvents === "all" || captureEvents === "click") {
    eventHandlers.onClick = stopEvent;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Component, {
    ...rest,
    ...eventHandlers,
    className: className,
    children: children
  });
};
exports.EventBoundary = EventBoundary;
var _default = exports.default = EventBoundary;