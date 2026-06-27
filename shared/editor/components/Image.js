"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InlineIconMaxWidth = exports.Error = void 0;
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _reactI18next = require("react-i18next");
var _compat = require("es-toolkit/compat");
var _Flex = _interopRequireDefault(require("../../components/Flex"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/** Images rendered smaller than this width are displayed as inline icons. */
const InlineIconMaxWidth = exports.InlineIconMaxWidth = 48;
const Image = props => {
  const {
    isSelected,
    node,
    isEditable,
    onChangeSize,
    onClick
  } = props;
  const {
    src,
    layoutClass
  } = node.attrs;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [naturalWidth, setNaturalWidth] = React.useState(node.attrs.width);
  const [naturalHeight, setNaturalHeight] = React.useState(node.attrs.height);
  const lastTapTimeRef = React.useRef(0);
  const ref = React.useRef(null);
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
  const isFullWidth = layoutClass === "full-width";
  const isInlineIcon = !isFullWidth && !!width && width < InlineIconMaxWidth && !error;
  const isResizable = !!props.onChangeSize && !error && !isInlineIcon;
  const isDownloadable = !!props.onDownload && !error;
  const className = ["image", layoutClass ? `image-${layoutClass}` : "", isInlineIcon ? "image-icon" : ""].filter(Boolean).join(" ");
  React.useEffect(() => {
    if (node.attrs.width && node.attrs.width !== width) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.width]);
  const sanitizedSrc = (0, _urls.sanitizeImageSrc)(src);
  const linkMarkType = props.view.state.schema.marks.link;
  const imgLink = (0, _compat.find)(node.attrs.marks ?? [], mark => mark.type === linkMarkType.name)?.attrs.href ||
  // Coalescing to `undefined` to avoid empty string in href because empty string
  // in href still shows pointer on hover and click navigates to nowhere
  undefined;
  const handleOpen = React.useCallback(() => {
    window.open(sanitizedSrc, "_blank");
  }, [sanitizedSrc]);
  const widthStyle = isFullWidth ? {
    width: "var(--container-width)"
  } : {
    width: width || "auto"
  };
  const handleImageTouchStart = ev => {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTimeRef.current;
    if (timeSinceLastTap < 300 && isSelected) {
      ev.preventDefault();
      onClick();
    }
    lastTapTimeRef.current = currentTime;
  };
  const handleImageClick = ev => {
    if (!isEditable || isSelected) {
      ev.preventDefault();
      onClick();
    }
  };
  const handleDownload = async ev => {
    ev.preventDefault();
    if (props.onDownload) {
      setIsDownloading(true);
      try {
        await props.onDownload(ev);
      } finally {
        setIsDownloading(false);
      }
    }
  };
  const actions = [(0, _urls.isExternalUrl)(src) && /*#__PURE__*/(0, _jsxRuntime.jsx)(Button, {
    onClick: handleOpen,
    "aria-label": t("Open"),
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.GlobeIcon, {})
  }, "open"), imgLink && /*#__PURE__*/(0, _jsxRuntime.jsx)(Button, {
    // `mousedown` on ancestor `div.ProseMirror` was preventing the `onClick` handler from firing
    onMouseDown: e => e.stopPropagation(),
    onClick: props.onZoomIn,
    "aria-label": t("Zoom in"),
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.ZoomInIcon, {})
  }, "zoom"), !isEditable && /*#__PURE__*/(0, _jsxRuntime.jsx)(Button, {
    onClick: handleDownload
    // `mousedown` on ancestor `div.ProseMirror` was preventing the `onClick` handler from firing
    ,
    onMouseDown: e => e.stopPropagation(),
    "aria-label": t("Download"),
    disabled: isDownloading,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.DownloadIcon, {})
  }, "download")].filter(Boolean);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    contentEditable: false,
    className: className,
    ref: ref,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(ImageWrapper, {
      isFullWidth: isFullWidth,
      $dragging: !!dragging,
      className: isSelected || dragging ? "image-wrapper ProseMirror-selectednode" : "image-wrapper",
      style: widthStyle,
      children: [!dragging && width > 60 && isDownloadable && actions.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(Actions, {
        children: actions.map((action, index) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
          children: [index > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(Separator, {
            height: 24
          }), action]
        }, index))
      }), error ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Error, {
        className: _EditorStyleHelper.EditorStyleHelper.imageHandle,
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
          gap: 4,
          align: "center",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.CrossIcon, {
            size: 16
          }), width > 300 ? t("Image failed to load") : null]
        })
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
        href: imgLink
        // Do not show hover preview when the image is selected
        ,
        className: !isSelected ? "use-hover-preview" : "",
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
          className: _EditorStyleHelper.EditorStyleHelper.imageHandle,
          style: {
            ...widthStyle,
            display: loaded ? "block" : "none"
          },
          src: sanitizedSrc,
          alt: node.attrs.alt || "",
          onError: () => {
            setError(true);
            setLoaded(true);
          },
          onLoad: ev => {
            // For some SVG's Firefox does not provide the naturalWidth, in this
            // rare case we need to provide a default so that the image can be
            // seen and is not sized to 0px
            const nw = ev.target.naturalWidth || 300;
            const nh = ev.target.naturalHeight;
            setNaturalWidth(nw);
            setNaturalHeight(nh);
            setLoaded(true);
            if (!node.attrs.width) {
              setSize(state => ({
                ...state,
                width: nw
              }));
            }
          },
          onClick: handleImageClick,
          onTouchStart: handleImageTouchStart
        })
      }), !loaded && width && height && /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
        alt: "",
        style: {
          ...widthStyle,
          display: "block"
        },
        src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getPlaceholder(width, height))}`
      }), isEditable && !isFullWidth && isResizable && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeLeft, {
          onPointerDown: handlePointerDown("left"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeRight, {
          onPointerDown: handlePointerDown("right"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeTopLeft, {
          onPointerDown: handlePointerDown("topLeft"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeTopRight, {
          onPointerDown: handlePointerDown("topRight"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeBottomLeft, {
          onPointerDown: handlePointerDown("bottomLeft"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_ResizeHandle.ResizeBottomRight, {
          onPointerDown: handlePointerDown("bottomRight"),
          onDoubleClick: handleDoubleClick,
          $dragging: !!dragging
        })]
      })]
    }), isInlineIcon ? null : isFullWidth && props.children ? /*#__PURE__*/React.cloneElement(props.children, {
      style: widthStyle
    }) : props.children]
  });
};
function getPlaceholder(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" />`;
}
const Error = exports.Error = (0, _styledComponents.default)(_Flex.default).withConfig({
  componentId: "sc-8i4f3i-0"
})(["max-width:100%;color:", ";font-size:14px;background:", ";border-radius:", ";height:80px;align-items:center;justify-content:center;user-select:none;"], (0, _styles.s)("textTertiary"), (0, _styles.s)("backgroundSecondary"), _EditorStyleHelper.EditorStyleHelper.blockRadius);
const Actions = _styledComponents.default.div.withConfig({
  componentId: "sc-8i4f3i-1"
})(["display:flex;align-items:center;position:absolute;top:8px;right:8px;opacity:0;transition:opacity 150ms ease-in-out;&:hover{opacity:1;}"]);
const Button = _styledComponents.default.button.withConfig({
  componentId: "sc-8i4f3i-2"
})(["border:0;margin:0;padding:0;border-radius:4px;background:", ";color:", ";width:24px;height:24px;display:inline-block;cursor:var(--pointer);transition:opacity 150ms ease-in-out;&:first-child:not(:last-child){border-top-right-radius:0;border-bottom-right-radius:0;}&:last-child:not(:first-child){border-top-left-radius:0;border-bottom-left-radius:0;}&:active{transform:scale(0.98);}&:hover{color:", ";}&:disabled{opacity:0.5;cursor:wait;pointer-events:none;&:hover{color:", ";}&:active{transform:none;}}"], (0, _styles.s)("background"), (0, _styles.s)("textSecondary"), (0, _styles.s)("text"), (0, _styles.s)("textSecondary"));
const ImageWrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-8i4f3i-3"
})(["line-height:0;position:relative;margin-left:auto;margin-right:auto;max-width:", ";transition-property:width,height;transition-duration:", ";transition-timing-function:ease-in-out;overflow:visible;img{transition-property:width,height;transition-duration:", ";transition-timing-function:ease-in-out;}&:hover{", "{opacity:0.9;}", ",", ",", ",", ",", ",", "{opacity:1;}}"], props => props.isFullWidth ? "initial" : "100%", props => props.isFullWidth || props.$dragging ? "0ms" : "150ms", props => props.isFullWidth || props.$dragging ? "0ms" : "150ms", Actions, _ResizeHandle.ResizeLeft, _ResizeHandle.ResizeRight, _ResizeHandle.ResizeTopLeft, _ResizeHandle.ResizeTopRight, _ResizeHandle.ResizeBottomLeft, _ResizeHandle.ResizeBottomRight);
const Separator = _styledComponents.default.div.withConfig({
  componentId: "sc-8i4f3i-4"
})(["flex-shrink:0;width:1px;height:", "px;background:", ";"], props => props.height || 28, (0, _styles.s)("divider"));
var _default = exports.default = Image;