"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Video;
exports.videoStyle = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _urls = require("../../utils/urls");
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Video(props) {
  const {
    isSelected,
    node,
    isEditable,
    children,
    onChangeSize
  } = props;
  const [naturalWidth] = React.useState(node.attrs.width);
  const [naturalHeight] = React.useState(node.attrs.height);
  const ref = React.useRef(null);
  const isResizable = !!onChangeSize;
  const {
    width,
    height,
    setSize,
    handlePointerDown,
    handleDoubleClick,
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
    if (node.attrs.width && node.attrs.width !== width) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.width]);
  const style = {
    width: width || "auto",
    maxHeight: height || "auto",
    pointerEvents: dragging ? "none" : "all"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    contentEditable: false,
    ref: ref,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(VideoWrapper, {
      className: isSelected ? "ProseMirror-selectednode" : "",
      $dragging: !!dragging,
      style: style,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(StyledVideo, {
        src: (0, _urls.sanitizeUrl)(node.attrs.src),
        title: node.attrs.title,
        style: style,
        controls: !dragging
      }), isEditable && isResizable && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeLeft, {
          onPointerDown: handlePointerDown("left"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeRight, {
          onPointerDown: handlePointerDown("right"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        })]
      })]
    }), children]
  });
}
const videoStyle = exports.videoStyle = (0, _styledComponents.css)(["max-width:100%;height:auto;background:", ";color:", " !important;margin:-2px;padding:2px;border-radius:8px;box-shadow:0 0 0 1px ", ";"], props => props.theme.background, props => props.theme.text, props => props.theme.divider);
const StyledVideo = _styledComponents.default.video.withConfig({
  componentId: "sc-184nh9t-0"
})(["", ""], videoStyle);
const VideoWrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-184nh9t-1"
})(["line-height:0;position:relative;margin-left:auto;margin-right:auto;white-space:nowrap;cursor:default;border-radius:8px;user-select:none;max-width:100%;overflow:hidden;transition-property:width,max-height;transition-duration:", ";transition-timing-function:ease-in-out;video{transition-property:width,max-height;transition-duration:", ";transition-timing-function:ease-in-out;}&:hover{", ",", "{opacity:1;}}"], props => props.$dragging ? "0ms" : "150ms", props => props.$dragging ? "0ms" : "150ms", _ResizeHandle.ResizeLeft, _ResizeHandle.ResizeRight);