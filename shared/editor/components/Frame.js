"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _outlineIcons = require("outline-icons");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Frame = _ref => {
  let {
    border,
    style = {},
    forwardedRef,
    icon,
    title,
    canonicalUrl,
    isSelected,
    referrerPolicy,
    className = "",
    src,
    ...rest
  } = _ref;
  const [isLoaded, setIsLoaded] = (0, _react.useState)(false);
  const mountedRef = (0, _react.useRef)(true);
  (0, _react.useEffect)(() => {
    // Set mounted flag
    mountedRef.current = true;

    // Load iframe after a small delay
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoaded(true);
      }
    }, 0);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);
  const showBottomBar = !!(icon || canonicalUrl);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Rounded, {
    style: style,
    $showBottomBar: showBottomBar,
    $border: border,
    className: isSelected ? `ProseMirror-selectednode ${className}` : className,
    children: [isLoaded && /*#__PURE__*/(0, _jsxRuntime.jsx)(Iframe, {
      ref: forwardedRef,
      $showBottomBar: showBottomBar,
      sandbox: "allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-storage-access-by-user-activation",
      allow: "fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write",
      style: style,
      frameBorder: "0",
      title: "embed",
      loading: "lazy",
      src: (0, _urls.sanitizeUrl)(src),
      referrerPolicy: referrerPolicy,
      allowFullScreen: true,
      ...rest
    }), showBottomBar && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Bar, {
      children: [icon, " ", /*#__PURE__*/(0, _jsxRuntime.jsx)(Title, {
        children: title
      }), canonicalUrl && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Open, {
        href: canonicalUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.OpenIcon, {
          size: 18
        }), " Open"]
      })]
    })]
  });
};
const Iframe = _styledComponents.default.iframe.withConfig({
  componentId: "sc-1gbf3fk-0"
})(["border-radius:", ";display:block;"], props => props.$showBottomBar ? "3px 3px 0 0" : "3px");
const Rounded = _styledComponents.default.div.withConfig({
  componentId: "sc-1gbf3fk-1"
})(["border:1px solid ", ";border-radius:6px;overflow:hidden;", ""], props => props.$border ? props.theme.embedBorder : "transparent", props => props.$showBottomBar && `
    padding-bottom: 28px;
  `);
const Open = _styledComponents.default.a.withConfig({
  componentId: "sc-1gbf3fk-2"
})(["color:", " !important;font-size:13px;font-weight:500;align-items:center;display:flex;position:absolute;right:0;padding:0 8px;"], (0, _styles.s)("textSecondary"));
const Title = _styledComponents.default.span.withConfig({
  componentId: "sc-1gbf3fk-3"
})(["font-size:13px;font-weight:500;padding-left:4px;"]);
const Bar = _styledComponents.default.div.withConfig({
  componentId: "sc-1gbf3fk-4"
})(["display:flex;align-items:center;border-top:1px solid ", ";background:", ";color:", ";padding:0 8px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;user-select:none;height:28px;position:relative;"], props => props.theme.embedBorder, (0, _styles.s)("backgroundSecondary"), (0, _styles.s)("textSecondary"));
var _default = exports.default = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/(0, _jsxRuntime.jsx)(Frame, {
  ...props,
  forwardedRef: ref
}));