"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorTables = require("prosemirror-tables");
var _Node = _interopRequireDefault(require("./Node"));
var _utils = require("../styles/utils");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _prosemirrorView = require("prosemirror-view");
var _prosemirrorState = require("prosemirror-state");
var _table = require("../commands/table");
var _browser = require("../../utils/browser");
var _table2 = require("../queries/table");
var _TableDragState = require("../plugins/TableDragState");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Sets up drag tracking for row grip interactions.
 *
 * @param view The editor view.
 * @param gripElement The grip element being dragged.
 * @param fromIndex The index of the row being dragged.
 */
function setupRowDragTracking(view, gripElement, fromIndex) {
  let isDragging = false;
  let currentToIndex = fromIndex;

  /**
   * Finds the table wrapper element from the current editor DOM.
   */
  const findTableElement = () => {
    const tables = view.dom.querySelectorAll(`.${_EditorStyleHelper.EditorStyleHelper.table}`);
    if (tables.length === 1) {
      return tables[0];
    }
    for (const table of tables) {
      if (table.querySelector(".selectedCell") || table.querySelector("[class*='selected']")) {
        return table;
      }
    }
    return tables.length > 0 ? tables[0] : null;
  };

  /**
   * Updates the drag state in the plugin via a transaction.
   */
  const updateDragState = toIndex => {
    const tr = view.state.tr.setMeta(_TableDragState.rowDragPluginKey, {
      isDragging: true,
      fromIndex,
      toIndex
    });
    view.dispatch(tr);
  };

  /**
   * Clears the drag state in the plugin.
   */
  const clearDragState = () => {
    const tr = view.state.tr.setMeta(_TableDragState.rowDragPluginKey, {
      isDragging: false,
      fromIndex: -1,
      toIndex: -1
    });
    view.dispatch(tr);
  };
  const handleMouseMove = e => {
    const tableElement = findTableElement();
    if (!tableElement) {
      return;
    }
    if (!isDragging) {
      isDragging = true;
      document.body.classList.add(_EditorStyleHelper.EditorStyleHelper.tableDragging);
    }
    const table = tableElement.querySelector("table");
    if (!table) {
      return;
    }
    const rows = (0, _table2.getRowsInTable)(view.state);
    const tableRows = table.querySelectorAll("tr");
    let targetIndex = fromIndex;
    tableRows.forEach((row, index) => {
      const rect = row.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetIndex = index;
      }
    });
    targetIndex = Math.max(0, Math.min(targetIndex, rows.length - 1));
    if (targetIndex !== currentToIndex) {
      currentToIndex = targetIndex;
      updateDragState(targetIndex);
    }
  };
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.classList.remove(_EditorStyleHelper.EditorStyleHelper.tableDragging);
    if (isDragging && currentToIndex !== fromIndex && (0, _prosemirrorTables.isInTable)(view.state)) {
      // Verify both indices are still valid for the current table. The document
      // may have changed during the drag (e.g. collaborative editing)
      const currentRows = (0, _table2.getRowsInTable)(view.state);
      const inBounds = fromIndex >= 0 && fromIndex < currentRows.length && currentToIndex >= 0 && currentToIndex < currentRows.length;
      if (inBounds) {
        const moved = (0, _prosemirrorTables.moveTableRow)({
          from: fromIndex,
          to: currentToIndex
        })(view.state, view.dispatch);
        if (moved) {
          // Select the row at its new position
          (0, _table.selectRow)(currentToIndex)(view.state, view.dispatch);
        }
      }
    }
    clearDragState();
  };
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

/**
 * Builds a widget decoration for the row drag indicator.
 */
function buildRowDragIndicator(pos, isMovingDown) {
  const className = isMovingDown ? _EditorStyleHelper.EditorStyleHelper.tableDragIndicatorBottom : _EditorStyleHelper.EditorStyleHelper.tableDragIndicatorTop;
  return _prosemirrorView.Decoration.widget(pos + 1, () => {
    const indicator = document.createElement("div");
    indicator.className = className;
    return indicator;
  }, {
    key: `row-drag-indicator-${pos}`
  });
}

/**
 * Creates decorations for the row drag drop indicator.
 */
function createRowDragDecorations(state) {
  const dragState = _TableDragState.rowDragPluginKey.getState(state);
  if (!dragState?.isDragging || dragState.toIndex < 0) {
    return _prosemirrorView.DecorationSet.empty;
  }
  const decorations = [];
  const isMovingDown = dragState.toIndex > dragState.fromIndex;

  // Get first cell in the target row to place the indicator
  const cellsInRow = (0, _table2.getCellsInRow)(dragState.toIndex)(state);
  if (cellsInRow.length > 0) {
    decorations.push(buildRowDragIndicator(cellsInRow[0], isMovingDown));
  }
  return _prosemirrorView.DecorationSet.create(state.doc, decorations);
}
class TableRow extends _Node.default {
  get name() {
    return "tr";
  }
  get schema() {
    return {
      content: "(th | td)*",
      tableRole: "row",
      parseDOM: [{
        tag: "tr"
      }],
      toDOM() {
        return ["tr", 0];
      }
    };
  }
  get plugins() {
    // Plugin for row drag and drop indicator
    const rowDragPlugin = new _prosemirrorState.Plugin({
      key: _TableDragState.rowDragPluginKey,
      state: {
        init: () => ({
          isDragging: false,
          fromIndex: -1,
          toIndex: -1
        }),
        apply: (tr, state) => {
          const meta = tr.getMeta(_TableDragState.rowDragPluginKey);
          if (meta) {
            return meta;
          }
          return state;
        }
      },
      props: {
        decorations: createRowDragDecorations
      }
    });
    function buildAddRowDecoration(pos, index) {
      const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableAddRow, {
        first: index === 0
      });
      return _prosemirrorView.Decoration.widget(pos + 1, () => {
        const plus = document.createElement("a");
        plus.role = "button";
        plus.className = className;
        plus.dataset.index = index.toString();
        return plus;
      }, {
        key: (0, _utils.cn)(className, index)
      });
    }
    return [rowDragPlugin, new _prosemirrorState.Plugin({
      props: {
        decorations: state => {
          if (!this.editor.view?.editable) {
            return;
          }

          // Hide add row buttons when dragging rows or columns
          const rowDragState = _TableDragState.rowDragPluginKey.getState(state);
          const columnDragState = _TableDragState.columnDragPluginKey.getState(state);
          const isDragging = rowDragState?.isDragging || columnDragState?.isDragging;
          const {
            doc
          } = state;
          const decorations = [];
          const rows = (0, _table2.getRowsInTable)(state);
          if (rows && rows.length > 0 && (0, _prosemirrorTables.isInTable)(state)) {
            const rect = (0, _prosemirrorTables.selectedRect)(state);
            const firstColumnCells = new Map();

            // Map each visual row index to its first column cell position
            for (let row = 0; row < rect.map.height; row++) {
              const cellPos = rect.tableStart + rect.map.map[row * rect.map.width];
              firstColumnCells.set(row, cellPos);
            }
            rows.forEach((pos, visualIndex) => {
              const index = visualIndex;

              // Check if this row's first column is part of a merged cell from above
              const currentFirstCellPos = firstColumnCells.get(visualIndex);
              let isFirstColumnMerged = false;
              for (let prevRow = 0; prevRow < visualIndex; prevRow++) {
                if (firstColumnCells.get(prevRow) === currentFirstCellPos) {
                  isFirstColumnMerged = true;
                  break;
                }
              }

              // Skip decorations for rows where first column is merged from above
              if (isFirstColumnMerged) {
                return;
              }
              if (index === 0) {
                const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGrip, {
                  selected: (0, _table2.isTableSelected)(state)
                });
                decorations.push(_prosemirrorView.Decoration.widget(pos + 1, () => {
                  const grip = document.createElement("a");
                  grip.role = "button";
                  grip.className = className;
                  return grip;
                }, {
                  key: className
                }));
              }
              const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGripRow, {
                selected: (0, _table2.isRowSelected)(index)(state) || (0, _table2.isTableSelected)(state),
                first: index === 0,
                last: visualIndex === rows.length - 1
              });
              decorations.push(_prosemirrorView.Decoration.widget(pos + 1, () => {
                const grip = document.createElement("a");
                grip.role = "button";
                grip.className = className;
                grip.dataset.index = index.toString();
                return grip;
              }, {
                key: (0, _utils.cn)(className, index)
              }));

              // The add-row affordance is too small to tap on mobile, where
              // rows can be added via the inline menu instead.
              if (!isDragging && !(0, _browser.isMobile)()) {
                if (index === 0) {
                  decorations.push(buildAddRowDecoration(pos, index));
                }

                // Calculate the rowspan of the first column cell to determine the
                // correct index for the "add row after" button. When cells are
                // merged vertically, we need to insert after all merged rows.
                const firstCellNode = currentFirstCellPos !== undefined ? doc.nodeAt(currentFirstCellPos) : null;
                const rowspan = firstCellNode?.attrs.rowspan ?? 1;
                decorations.push(buildAddRowDecoration(pos, index + rowspan));
              }
            });
          }
          return _prosemirrorView.DecorationSet.create(doc, decorations);
        },
        handleDOMEvents: {
          mousedown: (view, event) => {
            if (!(event.target instanceof HTMLElement)) {
              return false;
            }
            const targetAddRow = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableAddRow}`);
            if (targetAddRow) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const index = Number(targetAddRow.getAttribute("data-index"));
              (0, _table.addRowBefore)({
                index
              })(view.state, view.dispatch);
              return true;
            }
            const tableGrip = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGrip}`);
            if (tableGrip) {
              event.preventDefault();
              event.stopImmediatePropagation();
              (0, _table.selectTable)()(view.state, view.dispatch);
              return true;
            }
            const targetGripRow = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGripRow}`);
            if (targetGripRow instanceof HTMLElement) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const rowIndex = Number(targetGripRow.getAttribute("data-index"));
              (0, _table.selectRow)(rowIndex, event.metaKey || event.shiftKey)(view.state, view.dispatch);

              // Setup drag tracking for potential drag operation
              setupRowDragTracking(view, targetGripRow, rowIndex);
              return true;
            }
            return false;
          }
        }
      }
    })];
  }
  toMarkdown() {
    // see: renderTable
  }
  parseMarkdown() {
    return {
      block: "tr"
    };
  }
}
exports.default = TableRow;