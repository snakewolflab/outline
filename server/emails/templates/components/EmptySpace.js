"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _oyVey = require("oy-vey");
var React = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const EmptySpace = _ref => {
  let {
    height
  } = _ref;
  height = height || 16;
  const style = {
    lineHeight: `${height}px`,
    fontSize: "1px",
    msoLineHeightRule: "exactly"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.Table, {
    width: "100%",
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TBody, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TD, {
          width: "100%",
          height: `${height}px`,
          style: style,
          dangerouslySetInnerHTML: {
            __html: "&nbsp;"
          }
        })
      })
    })
  });
};
var _default = exports.default = EmptySpace;