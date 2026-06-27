"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _embeds = require("../lib/embeds");
var _DisabledEmbed = _interopRequireDefault(require("./DisabledEmbed"));
var _Frame = _interopRequireDefault(require("./Frame"));
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Embed = props => {
  const ref = React.useRef(null);
  const {
    node,
    isEditable,
    embedsDisabled,
    onChangeSize
  } = props;
  const naturalWidth = 0;
  const naturalHeight = 400;
  const isResizable = !!onChangeSize && !embedsDisabled;
  const {
    width,
    height,
    setSize,
    handlePointerDown,
    dragging
  } = (0, _useDragResize.default)({
    width: node.attrs.width ?? naturalWidth,
    height: node.attrs.height ?? naturalHeight,
    naturalWidth,
    naturalHeight,
    onChangeSize,
    ref
  });
  React.useEffect(() => {
    if (node.attrs.height && node.attrs.height !== height) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.height]);
  const style = {
    width: width || "100%",
    height: height || 400,
    maxWidth: "100%",
    pointerEvents: dragging ? "none" : "all"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(FrameWrapper, {
    ref: ref,
    $dragging: !!dragging,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(InnerEmbed, {
      style: style,
      ...props
    }), isEditable && isResizable && /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeBottom, {
        onPointerDown: handlePointerDown("bottom"),
        $dragging: !!dragging
      })
    })]
  });
};
function InnerEmbed(_ref) {
  let {
    isEditable,
    isSelected,
    node,
    embeds,
    embedsDisabled,
    style
  } = _ref;
  const cache = React.useMemo(() => (0, _embeds.getMatchingEmbed)(embeds, node.attrs.href), [embeds, node.attrs.href]);
  if (!cache) {
    return null;
  }
  const {
    embed,
    matches
  } = cache;
  if (embedsDisabled) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_DisabledEmbed.default, {
      href: node.attrs.href,
      embed: embed,
      isEditable: isEditable,
      isSelected: isSelected
    });
  }
  if (embed.transformMatch) {
    const src = embed.transformMatch(matches);
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
      src: src,
      style: style,
      isSelected: isSelected,
      canonicalUrl: embed.hideToolbar ? undefined : node.attrs.href,
      title: embed.title,
      referrerPolicy: "strict-origin-when-cross-origin",
      border: true
    });
  }
  if ("component" in embed) {
    return (
      /*#__PURE__*/
      // @ts-expect-error Component type
      (0, _jsxRuntime.jsx)(embed.component, {
        attrs: node.attrs,
        style: style,
        matches: matches,
        isEditable: isEditable,
        isSelected: isSelected,
        embed: embed
      })
    );
  }
  return null;
}
const FrameWrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-vz1eqm-0"
})(["line-height:0;position:relative;margin-left:auto;margin-right:auto;white-space:nowrap;cursor:default;border-radius:8px;user-select:none;max-width:100%;transition-property:width,max-height;transition-duration:", ";transition-timing-function:ease-in-out;&:hover{", ",", "{opacity:1;}}"], props => props.$dragging ? "0ms" : "150ms", _ResizeHandle.ResizeLeft, _ResizeHandle.ResizeRight);
var _default = exports.default = Embed;