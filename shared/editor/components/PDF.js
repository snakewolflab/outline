"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PdfViewer;
var _react = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
var _ResizeHandle = require("./ResizeHandle");
var _browser = require("../../utils/browser");
var _Flex = _interopRequireDefault(require("../../components/Flex"));
var _styles = require("../../styles");
var _Widget = require("./Widget");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Default dimensions for the PDF preview – approximately the width of a standard
 * document with an A4 portrait aspect ratio.
 */const naturalWidth = 768;
const naturalHeight = 1086;
function PdfViewer(props) {
  const {
    node,
    isEditable,
    onChangeSize,
    isSelected
  } = props;
  const {
    href,
    name
  } = node.attrs;
  const ref = (0, _react.useRef)(null);
  const embedRef = (0, _react.useRef)(null);
  const debounceTimerRef = (0, _react.useRef)(null);
  const {
    width,
    setSize,
    handlePointerDown,
    dragging
  } = (0, _useDragResize.default)({
    width: node.attrs.width,
    height: node.attrs.height,
    naturalWidth,
    naturalHeight,
    onChangeSize,
    ref
  });
  (0, _react.useEffect)(() => {
    if (node.attrs.width && node.attrs.width !== width) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.attrs.width]);

  // force embed to reload, so the content fits the new size.
  (0, _react.useEffect)(() => {
    // firefox handles resizing on its own
    // and forced reload causes the parent to collapse while resizing
    if (_browser.isFirefox || !ref.current) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (dragging) {
        return;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (embedRef.current) {
          embedRef.current.src = "";
          requestAnimationFrame(() => {
            if (embedRef.current) {
              embedRef.current.src = href;
            }
          });
        }
      }, 250);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [dragging, href]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(PDFWrapper, {
    contentEditable: false,
    ref: ref,
    className: isSelected || dragging ? "pdf-wrapper ProseMirror-selectednode" : "pdf-wrapper",
    style: {
      width: width ?? "100%"
    },
    $dragging: !!dragging,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
      gap: 6,
      align: "center",
      children: [props.icon, /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Widget.Preview, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Widget.Title, {
          children: props.title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Widget.Subtitle, {
          children: props.context
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("embed", {
      title: name,
      src: href,
      ref: embedRef,
      style: {
        width: "100%",
        height: "auto",
        aspectRatio: `${naturalWidth} / ${naturalHeight}`,
        pointerEvents: !isEditable || isSelected && !dragging ? "initial" : "none",
        marginTop: 6
      }
    }), isEditable && !!props.onChangeSize && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeLeft, {
        onPointerDown: handlePointerDown("left"),
        $dragging: !!(isSelected || dragging)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeRight, {
        onPointerDown: handlePointerDown("right"),
        $dragging: !!(isSelected || dragging)
      })]
    })]
  });
}
const PDFWrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-158fia3-0"
})(["line-height:0;position:relative;margin-left:auto;margin-right:auto;max-width:100%;transition-property:width,height;transition-duration:", ";transition-timing-function:ease-in-out;overflow:hidden;will-change:", ";box-shadow:0 0 0 1px ", ";border-radius:", ";padding:", ";embed{display:block;max-width:100%;transition-property:width,height;transition-duration:", ";transition-timing-function:ease-in-out;will-change:", ";}&:hover{", ",", "{opacity:1;}}"], props => props.$dragging ? "0ms" : "120ms", props => props.$dragging ? "width, height" : "auto", (0, _styles.s)("divider"), _EditorStyleHelper.EditorStyleHelper.blockRadius, _EditorStyleHelper.EditorStyleHelper.blockRadius, props => props.$dragging ? "0ms" : "120ms", props => props.$dragging ? "width, height" : "auto", _ResizeHandle.ResizeLeft, _ResizeHandle.ResizeRight);