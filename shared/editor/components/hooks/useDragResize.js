"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDragResize;
var React = _interopRequireWildcard(require("react"));
var _EditorStyleHelper = require("../../styles/EditorStyleHelper");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/** The minimum width an element can be resized to, as a fraction of the maximum width. */
const minWidthRatio = 0.05;
const resizeDragCursorProperty = "--resize-drag-cursor";

/**
 * Returns the CSS cursor value for a given resize drag direction.
 *
 * @param direction the active resize drag direction.
 * @return the matching CSS cursor keyword.
 */
function getResizeDragCursor(direction) {
  if (direction === "left" || direction === "right") {
    return "ew-resize";
  }
  if (direction === "bottom") {
    return "ns-resize";
  }
  if (direction === "topLeft" || direction === "bottomRight") {
    return "nwse-resize";
  }
  return "nesw-resize";
}

/**
 * Hook for resizing an element by dragging its sides.
 */

function useDragResize(props) {
  const {
    onChangeSize,
    naturalWidth,
    naturalHeight,
    gridHeightSnap,
    minHeight,
    ref,
    isCentered = true
  } = props;
  const [size, setSize] = React.useState({
    width: props.width,
    height: props.height
  });
  const [maxWidth, setMaxWidth] = React.useState(Infinity);
  const [offset, setOffset] = React.useState({
    x: 0,
    y: 0
  });
  const [sizeAtDragStart, setSizeAtDragStart] = React.useState(size);
  const [dragging, setDragging] = React.useState();
  const isResizable = !!onChangeSize;

  // Mirror the latest size into a ref so handlePointerUp can read it without
  // re-binding listeners on every pointermove that updates size.
  const sizeRef = React.useRef(size);
  sizeRef.current = size;
  const constrainWidth = React.useCallback((width, max) => {
    const minWidth = Math.min(naturalWidth, minWidthRatio * max);
    return Math.round(Math.min(max, Math.max(width, minWidth)));
  }, [naturalWidth]);
  const handlePointerMove = React.useCallback(event => {
    event.preventDefault();
    let diffX = 0;
    let diffY = 0;
    if (dragging === "left") {
      diffX = offset.x - event.pageX;
    } else if (dragging === "right") {
      diffX = event.pageX - offset.x;
    } else if (dragging === "bottom") {
      diffY = event.pageY - offset.y;
    } else if (dragging === "topLeft") {
      diffX = offset.x - event.pageX;
      diffY = offset.y - event.pageY;
    } else if (dragging === "topRight") {
      diffX = event.pageX - offset.x;
      diffY = offset.y - event.pageY;
    } else if (dragging === "bottomLeft") {
      diffX = offset.x - event.pageX;
      diffY = event.pageY - offset.y;
    } else if (dragging === "bottomRight") {
      diffX = event.pageX - offset.x;
      diffY = event.pageY - offset.y;
    }
    const isCorner = ["topLeft", "topRight", "bottomLeft", "bottomRight"].includes(dragging || "");
    if (isCorner && naturalHeight && naturalWidth) {
      const aspectRatio = naturalHeight / naturalWidth;
      const hFactor = isCentered ? 0.5 : 1;
      const factor = isCentered ? 2 : 1;
      const dW = (diffX * hFactor + diffY * aspectRatio) / (hFactor * hFactor + aspectRatio * aspectRatio);
      diffX = dW / factor;
    }
    if (diffX && sizeAtDragStart.width) {
      const factor = isCentered ? 2 : 1;
      const newWidth = sizeAtDragStart.width + diffX * factor;
      const constrainedWidth = constrainWidth(newWidth, maxWidth);
      const aspectRatio = naturalHeight / naturalWidth;

      // When dragged to or beyond the editor edge, store the natural width as a
      // sentinel for "full width" so the element stays responsive. Only do this
      // when the natural width actually exceeds the editor — otherwise constrain
      // to the editor edge rather than snapping a smaller image back down to its
      // natural size.
      const nextWidth = newWidth >= maxWidth && naturalWidth >= maxWidth ? naturalWidth : constrainedWidth;
      const nextHeight = isCorner ? naturalWidth ? Math.round(constrainedWidth * aspectRatio) : undefined : sizeAtDragStart.height;
      setSize({
        width: nextWidth,
        height: nextHeight
      });
      window.dispatchEvent(new CustomEvent("media-drag-resize", {
        detail: {
          width: nextWidth,
          height: nextHeight,
          isDragging: true
        }
      }));
    }
    if (diffY && sizeAtDragStart.height && !isCorner) {
      const gridHeight = gridHeightSnap ?? 10;
      const newHeight = sizeAtDragStart.height + diffY;
      const heightOnGrid = Math.round(newHeight / gridHeight) * gridHeight;
      const nextHeight = Math.max(heightOnGrid, minHeight ?? 50);
      setSize(state => {
        const nextState = {
          ...state,
          height: nextHeight
        };
        window.dispatchEvent(new CustomEvent("media-drag-resize", {
          detail: {
            ...nextState,
            isDragging: true
          }
        }));
        return nextState;
      });
    }
  }, [dragging, offset, sizeAtDragStart, maxWidth, gridHeightSnap, naturalWidth, naturalHeight, minHeight, constrainWidth]);
  const handlePointerUp = React.useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setOffset({
      x: 0,
      y: 0
    });
    setDragging(undefined);
    onChangeSize?.(sizeRef.current);
    window.dispatchEvent(new CustomEvent("media-drag-resize", {
      detail: {
        ...sizeRef.current,
        isDragging: false
      }
    }));
  }, [onChangeSize]);
  const handleKeyDown = React.useCallback(event => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setSize(sizeAtDragStart);
      setDragging(undefined);
      window.dispatchEvent(new CustomEvent("media-drag-resize", {
        detail: {
          ...sizeAtDragStart,
          isDragging: false
        }
      }));
    }
  }, [sizeAtDragStart]);
  const handleDoubleClick = () => {
    if (!isResizable) {
      return;
    }

    // Resize to original size
    const newSize = {
      width: naturalWidth,
      height: naturalHeight
    };
    setSize(newSize);
    onChangeSize?.(newSize);
  };
  const handlePointerDown = dragDirection => event => {
    event.preventDefault();
    event.stopPropagation();

    // Calculate constraints once at the start of dragging as it's relatively expensive operation
    const max = ref.current ? parseInt(getComputedStyle(ref.current).getPropertyValue("--document-width")) - _EditorStyleHelper.EditorStyleHelper.padding * 2 : Infinity;
    setMaxWidth(max);
    setSizeAtDragStart({
      // When no width has been set yet the element is displayed at full width,
      // so begin resizing from the maximum width rather than the minimum.
      width: constrainWidth(size.width || max, max),
      height: size.height
    });
    setOffset({
      x: event.pageX,
      y: event.pageY
    });
    setDragging(dragDirection);
  };
  React.useEffect(() => {
    if (!isResizable) {
      return;
    }
    if (dragging) {
      document.body.classList.add(_EditorStyleHelper.EditorStyleHelper.resizeDragging);
      document.body.style.setProperty(resizeDragCursorProperty, getResizeDragCursor(dragging));
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      document.body.classList.remove(_EditorStyleHelper.EditorStyleHelper.resizeDragging);
      document.body.style.removeProperty(resizeDragCursorProperty);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handleKeyDown, handlePointerMove, handlePointerUp, isResizable]);
  return {
    handlePointerDown,
    handleDoubleClick,
    dragging,
    setSize,
    width: size.width,
    height: size.height
  };
}