"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Link = void 0;
var _oyVey = require("oy-vey");
var React = _interopRequireWildcard(require("react"));
var _theme = _interopRequireDefault(require("../../../../shared/styles/theme"));
var _UrlHelper = require("../../../../shared/utils/UrlHelper");
var _env = _interopRequireDefault(require("../../../env"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Link = _ref => {
  let {
    href,
    children
  } = _ref;
  const linkStyle = {
    color: _theme.default.slate,
    fontWeight: 500,
    textDecoration: "none",
    marginRight: "10px"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
    href: href,
    style: linkStyle,
    children: children
  });
};
exports.Link = Link;
var _default = _ref2 => {
  let {
    unsubscribeUrl,
    unsubscribeText,
    children
  } = _ref2;
  const footerStyle = {
    padding: "20px 0",
    borderTop: `1px solid ${_theme.default.smokeDark}`,
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const footerLinkStyle = {
    padding: "0",
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const externalLinkStyle = {
    color: _theme.default.slate,
    textDecoration: "none",
    margin: "0 10px"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.Table, {
    width: "100%",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_oyVey.TBody, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_oyVey.TD, {
          style: footerStyle,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
            href: _env.default.URL,
            children: _env.default.APP_NAME
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: _UrlHelper.UrlHelper.twitter,
            style: externalLinkStyle,
            children: "Twitter"
          })]
        })
      }), unsubscribeUrl && /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TD, {
          style: footerLinkStyle,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
            href: unsubscribeUrl,
            children: unsubscribeText ?? "Unsubscribe from these emails"
          })
        })
      }), children && /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TD, {
          style: footerLinkStyle,
          children: children
        })
      })]
    })
  });
};
exports.default = _default;