"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.baseStyles = void 0;
var _oyVey = require("oy-vey");
var React = _interopRequireWildcard(require("react"));
var _theme = _interopRequireDefault(require("../../../../shared/styles/theme"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const EmailLayout = _ref => {
  let {
    previewText,
    bgcolor = "#FFFFFF",
    goToAction,
    children
  } = _ref;
  let markup;
  if (goToAction) {
    markup = JSON.stringify({
      "@context": "http://schema.org",
      "@type": "EmailMessage",
      potentialAction: {
        "@type": "ViewAction",
        url: goToAction.url,
        name: goToAction.name
      }
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [markup ? /*#__PURE__*/(0, _jsxRuntime.jsx)("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: {
        __html: markup
      }
    }) : null, /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.Table, {
      bgcolor: bgcolor,
      id: "__bodyTable__",
      width: "100%",
      style: {
        WebkitFontSmoothing: "antialiased",
        width: "100% !important",
        background: `${bgcolor}`,
        WebkitTextSizeAdjust: "none",
        margin: 0,
        padding: 0,
        minWidth: "100%"
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_oyVey.TD, {
          align: "center",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            style: {
              display: "none !important",
              color: `${bgcolor}`,
              margin: 0,
              padding: 0,
              fontSize: "1px",
              lineHeight: "1px"
            },
            children: previewText
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.Table, {
            width: "550",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TBody, {
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TR, {
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_oyVey.TD, {
                  align: "left",
                  children: children
                })
              })
            })
          })]
        })
      })
    })]
  });
};
var _default = exports.default = EmailLayout;
const baseStyles = exports.baseStyles = `
  #__bodyTable__ {
    font-family: ${_theme.default.fontFamily};
    font-size: 16px;
    line-height: 1.5;
  }

  @media (prefers-color-scheme: dark) {
    .email-button {
      background: #FFFFFF !important;
      color: #000000 !important;
    }
  }
`;