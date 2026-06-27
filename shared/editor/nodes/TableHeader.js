"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _prosemirrorTables = require("prosemirror-tables");
var _table = require("../commands/table");
var _browser = require("../../utils/browser");
var _table2 = require("../lib/table");
var _table3 = require("../queries/table");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _utils = require("../styles/utils");
var _Node = _interopRequireDefault(require("./Node"));
var _TableDragState = require("../plugins/TableDragState");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Sets up drag tracking for column grip interactions.
 *
 * @param view The editor view.
 * @param gripElement The grip element being dragged.
 * @param fromIndex The index of the column being dragged.
 */
function setupColumnDragTracking(view, gripElement, fromIndex) {
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
    const tr = view.state.tr.setMeta(_TableDragState.columnDragPluginKey, {
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
    const tr = view.state.tr.setMeta(_TableDragState.columnDragPluginKey, {
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
    const headerRow = table.querySelector("tr");
    if (!headerRow) {
      return;
    }
    const cells = headerRow.querySelectorAll("th, td");
    const cols = (0, _table3.getCellsInRow)(0)(view.state);
    let targetIndex = fromIndex;
    cells.forEach((cell, index) => {
      const rect = cell.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        targetIndex = index;
      }
    });
    targetIndex = Math.max(0, Math.min(targetIndex, cols.length - 1));
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
      const currentCols = (0, _table3.getCellsInRow)(0)(view.state);
      const inBounds = fromIndex >= 0 && fromIndex < currentCols.length && currentToIndex >= 0 && currentToIndex < currentCols.length;
      if (inBounds) {
        const moved = (0, _prosemirrorTables.moveTableColumn)({
          from: fromIndex,
          to: currentToIndex
        })(view.state, view.dispatch);
        if (moved) {
          // Select the column at its new position
          (0, _table.selectColumn)(currentToIndex)(view.state, view.dispatch);
        }
      }
    }
    clearDragState();
  };
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

/**
 * Builds a widget decoration for the column drag indicator.
 */
function buildColumnDragIndicator(pos, isMovingRight) {
  const className = isMovingRight ? _EditorStyleHelper.EditorStyleHelper.tableDragIndicatorRight : _EditorStyleHelper.EditorStyleHelper.tableDragIndicatorLeft;
  return _prosemirrorView.Decoration.widget(pos + 1, () => {
    const indicator = document.createElement("div");
    indicator.className = className;
    return indicator;
  }, {
    key: `column-drag-indicator-${pos}`
  });
}

/**
 * Creates decorations for the column drag drop indicator.
 */
function createColumnDragDecorations(state) {
  const dragState = _TableDragState.columnDragPluginKey.getState(state);
  if (!dragState?.isDragging || dragState.toIndex < 0) {
    return _prosemirrorView.DecorationSet.empty;
  }
  const decorations = [];
  const isMovingRight = dragState.toIndex > dragState.fromIndex;

  // Get first cell in the target column to place the indicator
  const cellsInColumn = (0, _table3.getCellsInColumn)(dragState.toIndex)(state);
  if (cellsInColumn.length > 0) {
    decorations.push(buildColumnDragIndicator(cellsInColumn[0], isMovingRight));
  }
  return _prosemirrorView.DecorationSet.create(state.doc, decorations);
}
class TableHeader extends _Node.default {
  get name() {
    return "th";
  }
  get schema() {
    return {
      content: "block+",
      tableRole: "header_cell",
      group: "cell",
      isolating: true,
      parseDOM: [{
        tag: "th",
        getAttrs: _table2.getCellAttrs
      }],
      toDOM(node) {
        return ["th", (0, _table2.setCellAttrs)(node), 0];
      },
      attrs: {
        colspan: {
          default: 1
        },
        rowspan: {
          default: 1
        },
        alignment: {
          default: null,
          validate: _table2.isValidCellAlignment
        },
        colwidth: {
          default: null
        },
        marks: {
          default: undefined,
          validate: value => (0, _table2.isValidCellMarks)(value, this.editor?.schema)
        }
      }
    };
  }
  toMarkdown() {
    // see: renderTable
  }
  parseMarkdown() {
    return {
      block: "th",
      getAttrs: tok => ({
        alignment: (0, _table2.isValidCellAlignment)(tok.info) ? tok.info : null
      })
    };
  }
  get plugins() {
    function buildAddColumnDecoration(pos, index) {
      const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableAddColumn, {
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

    // Plugin for column drag and drop indicator
    const columnDragPlugin = new _prosemirrorState.Plugin({
      key: _TableDragState.columnDragPluginKey,
      state: {
        init: () => ({
          isDragging: false,
          fromIndex: -1,
          toIndex: -1
        }),
        apply: (tr, state) => {
          const meta = tr.getMeta(_TableDragState.columnDragPluginKey);
          if (meta) {
            return meta;
          }
          return state;
        }
      },
      props: {
        decorations: createColumnDragDecorations
      }
    });
    const createColumnDecorations = state => {
      if (!this.editor.view?.editable) {
        return _prosemirrorView.DecorationSet.empty;
      }

      // Hide add column buttons when dragging rows or columns
      const columnDragState = _TableDragState.columnDragPluginKey.getState(state);
      const rowDragState = _TableDragState.rowDragPluginKey.getState(state);
      const isDragging = columnDragState?.isDragging || rowDragState?.isDragging;
      const {
        doc
      } = state;
      const decorations = [];
      const cols = (0, _table3.getCellsInRow)(0)(state);
      if (cols) {
        cols.forEach((pos, index) => {
          const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGripColumn, {
            selected: (0, _table3.isColumnSelected)(index)(state) || (0, _table3.isTableSelected)(state),
            first: index === 0,
            last: index === cols.length - 1
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

          // The add-column affordance is too small to tap on mobile, where
          // columns can be added via the inline menu instead.
          if (!isDragging && !(0, _browser.isMobile)()) {
            if (index === 0) {
              decorations.push(buildAddColumnDecoration(pos, index));
            }
            decorations.push(buildAddColumnDecoration(pos, index + 1));
          }
        });
      }
      return _prosemirrorView.DecorationSet.create(doc, decorations);
    };
    const createHeaderDecorations = state => {
      const {
        doc
      } = state;
      const decorations = [];

      // Iterate through all tables in the document
      doc.descendants((node, pos) => {
        if (node.type.spec.tableRole === "table") {
          const map = _prosemirrorTables.TableMap.get(node);

          // Mark cells in the first column and last row of this table
          node.descendants((cellNode, cellPos) => {
            if (cellNode.type.spec.tableRole === "header_cell") {
              const cellOffset = cellPos;
              const cellIndex = map.map.indexOf(cellOffset);
              if (cellIndex !== -1) {
                const col = cellIndex % map.width;
                const row = Math.floor(cellIndex / map.width);
                const rowspan = cellNode.attrs.rowspan || 1;
                const colspan = cellNode.attrs.colspan || 1;
                const attrs = {};
                if (col === 0) {
                  attrs["data-first-column"] = "true";
                }

                // Mark cells that extend into the last column (accounting for colspan)
                if (col + colspan >= map.width) {
                  attrs["data-last-column"] = "true";
                }

                // Mark cells that extend into the last row (accounting for rowspan)
                if (row + rowspan >= map.height) {
                  attrs["data-last-row"] = "true";
                }
                if (Object.keys(attrs).length > 0) {
                  decorations.push(_prosemirrorView.Decoration.node(pos + cellPos + 1, pos + cellPos + 1 + cellNode.nodeSize, attrs));
                }
              }
            }
          });
        }
      });
      return _prosemirrorView.DecorationSet.create(doc, decorations);
    };
    return [columnDragPlugin, new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("table-header-first-column"),
      state: {
        init: (_, state) => createHeaderDecorations(state),
        apply: (tr, pluginState, oldState, newState) => {
          // Only recompute if document changed
          if (!tr.docChanged) {
            return pluginState;
          }
          return createHeaderDecorations(newState);
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      }
    }), new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("table-header-decorations"),
      state: {
        init: (_, state) => createColumnDecorations(state),
        apply: (tr, pluginState, oldState, newState) => {
          // Recompute if selection, document, or drag state changed
          if (!tr.selectionSet && !tr.docChanged && !tr.getMeta(_TableDragState.columnDragPluginKey) && !tr.getMeta(_TableDragState.rowDragPluginKey)) {
            return pluginState;
          }
          return createColumnDecorations(newState);
        }
      },
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            if (!(event.target instanceof HTMLElement)) {
              return false;
            }
            const targetAddColumn = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableAddColumn}`);
            if (targetAddColumn) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const index = Number(targetAddColumn.getAttribute("data-index"));
              (0, _table.addColumnBefore)({
                index
              })(view.state, view.dispatch);
              return true;
            }
            const targetGripColumn = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGripColumn}`);
            if (targetGripColumn instanceof HTMLElement) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const colIndex = Number(targetGripColumn.getAttribute("data-index"));
              (0, _table.selectColumn)(colIndex, event.metaKey || event.shiftKey)(view.state, view.dispatch);

              // Setup drag tracking for potential drag operation
              setupColumnDragTracking(view, targetGripColumn, colIndex);
              return true;
            }
            return false;
          }
        },
        decorations(state) {
          return this.getState(state);
        }
      }
    })];
  }
}
exports.default = TableHeader;