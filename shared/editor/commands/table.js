"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addColumnAfter = addColumnAfter;
exports.addColumnBefore = addColumnBefore;
exports.addRowAfter = addRowAfter;
exports.addRowAndMoveSelection = addRowAndMoveSelection;
exports.addRowBefore = addRowBefore;
exports.createTable = createTable;
exports.createTableInner = createTableInner;
exports.deleteCellSelection = deleteCellSelection;
exports.deleteColSelection = deleteColSelection;
exports.deleteRowSelection = deleteRowSelection;
exports.deleteTableIfSelected = deleteTableIfSelected;
exports.distributeColumns = distributeColumns;
exports.exportTable = exportTable;
exports.mergeCellsAndCollapse = mergeCellsAndCollapse;
exports.moveOutOfTable = moveOutOfTable;
exports.selectColumn = selectColumn;
exports.selectRow = selectRow;
exports.selectTable = selectTable;
exports.setColumnAttr = setColumnAttr;
exports.setTableAttr = setTableAttr;
exports.sortTable = sortTable;
exports.splitCellAndCollapse = splitCellAndCollapse;
exports.toggleCellSelectionBackgroundAndCollapseSelection = exports.toggleCellSelectionBackground = void 0;
exports.toggleColumnBackground = toggleColumnBackground;
exports.toggleColumnBackgroundAndCollapseSelection = void 0;
exports.toggleRowBackground = toggleRowBackground;
exports.toggleRowBackgroundAndCollapseSelection = void 0;
var _prosemirrorGapcursor = require("prosemirror-gapcursor");
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _ProsemirrorHelper = require("../../utils/ProsemirrorHelper");
var _csv = require("../../utils/csv");
var _currency = require("../../utils/currency");
var _date = require("../../utils/date");
var _ip = require("../../utils/ip");
var _chainTransactions = require("../lib/chainTransactions");
var _table = require("../queries/table");
var _types = require("../types");
var _collapseSelection = require("./collapseSelection");
var _RowSelection = require("../selection/RowSelection");
var _ColumnSelection = require("../selection/ColumnSelection");
var _compat = require("es-toolkit/compat");
/**
 * Restores column selection after a table operation that may have changed cell
 * positions or content.
 *
 * @param tr The transaction to update.
 * @param tableStart The position inside the table (after the table node).
 * @param columnIndex The column index to select.
 */
function restoreColumnSelection(tr, tableStart, columnIndex) {
  const table = tr.doc.nodeAt(tableStart - 1);
  if (table) {
    const map = _prosemirrorTables.TableMap.get(table);
    const pos = map.positionAt(0, columnIndex, table);
    const $pos = tr.doc.resolve(tableStart + pos);
    tr.setSelection(_ColumnSelection.ColumnSelection.colSelection($pos));
  }
}

/**
 * A command that places a text cursor at the start of the cell at the given row
 * and column index within the table that begins at the given position. Used
 * after inserting a row or column so that the selection lands inside the newly
 * inserted cell rather than the shifted neighbouring one.
 *
 * @param tableStart The position inside the table (after the table node).
 * @param rowIndex The row index of the target cell.
 * @param columnIndex The column index of the target cell.
 * @returns The command.
 */
function setCursorInCell(tableStart, rowIndex, columnIndex) {
  return (state, dispatch) => {
    const table = state.doc.nodeAt(tableStart - 1);
    if (!table) {
      return false;
    }
    const map = _prosemirrorTables.TableMap.get(table);
    if (rowIndex >= map.height || columnIndex >= map.width) {
      return false;
    }
    const pos = map.positionAt(rowIndex, columnIndex, table);
    const $pos = state.doc.resolve(tableStart + pos + 1);
    dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.near($pos)));
    return true;
  };
}
function createTable(_ref) {
  let {
    rowsCount,
    colsCount,
    colWidth
  } = _ref;
  return (state, dispatch) => {
    if (dispatch) {
      const offset = state.tr.selection.anchor + 1;
      const nodes = createTableInner(state, rowsCount, colsCount, colWidth);
      const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
      const resolvedPos = tr.doc.resolve(offset);
      tr.setSelection(_prosemirrorState.TextSelection.near(resolvedPos));
      dispatch(tr);
    }
    return true;
  };
}
function createTableInner(state, rowsCount, colsCount, colWidth) {
  let withHeaderRow = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  let cellContent = arguments.length > 5 ? arguments[5] : undefined;
  const types = (0, _prosemirrorTables.tableNodeTypes)(state.schema);
  const headerCells = [];
  const cells = [];
  const rows = [];
  const createCell = (cellType, attrs) => cellContent ? cellType.createChecked(attrs, cellContent) : cellType.createAndFill(attrs);
  for (let index = 0; index < colsCount; index += 1) {
    const attrs = colWidth && index < colsCount - 1 ? {
      colwidth: [colWidth],
      colspan: 1,
      rowspan: 1
    } : null;
    const cell = createCell(types.cell, attrs);
    if (cell) {
      cells.push(cell);
    }
    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, attrs);
      if (headerCell) {
        headerCells.push(headerCell);
      }
    }
  }
  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells));
  }
  return types.table.createChecked(null, rows);
}
function exportTable(_ref2) {
  let {
    fileName
  } = _ref2;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const table = [];
      for (let r = 0; r < rect.map.height; r++) {
        const cells = [];
        for (let c = 0; c < rect.map.width; c++) {
          const cell = state.doc.nodeAt(rect.tableStart + rect.map.map[r * rect.map.width + c]);
          if (cell) {
            cells.push(cell);
          }
        }
        table.push(cells);
      }
      const csv = table.map(row => row.map(cell => {
        let value = _ProsemirrorHelper.ProsemirrorHelper.toPlainText(cell);

        // Escape double quotes by doubling them
        if (value.includes('"')) {
          value = value.replace(new RegExp('"', "g"), '""');
        }

        // Avoid cell content being interpreted as formulas by adding a leading single quote
        value = _csv.CSVHelper.sanitizeValue(value);
        return `"${value}"`;
      }).join(",")).join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
    return true;
  };
}

/**
 * A Commands that distributes the width of all selected columns evenly between them in the current table selection.
 *
 *
 * @returns {Command}
 */
function distributeColumns() {
  return (state, dispatch, view) => {
    if (!(0, _prosemirrorTables.isInTable)(state) || !dispatch) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const {
      tr,
      doc
    } = state;
    const {
      map
    } = rect;
    const selectedColumns = (0, _table.getAllSelectedColumns)(state);
    if (selectedColumns.length <= 1) {
      return false;
    }
    const hasNullWidth = selectedColumns.some(colIndex => isNullWidth({
      state,
      colIndex
    }));

    // whenever we can, we want to take the column width that prose-mirror sets
    // since that will always be accurate, when set
    const totalWidth = hasNullWidth ? (0, _table.getWidthFromDom)({
      view,
      rect,
      selectedColumns
    }) : (0, _table.getWidthFromNodes)({
      state,
      selectedColumns
    });
    if (totalWidth < 1) {
      return false;
    }
    const evenWidth = totalWidth / selectedColumns.length;
    const isLastColSelected = selectedColumns.includes(map.width - 1);
    const tableNode = doc.nodeAt(rect.tableStart - 1);
    const isFullWidth = tableNode?.attrs.layout === _types.TableLayout.fullWidth;
    for (let row = 0; row < map.height; row++) {
      const cellsInRow = (0, _table.getCellsInRow)(row)(state);
      if (!cellsInRow || cellsInRow.length < 1) {
        continue;
      }
      selectedColumns.forEach(colIndex => {
        const pos = cellsInRow[colIndex];
        const cell = pos !== undefined ? doc.nodeAt(pos) : null;
        if (!cell) {
          return;
        }
        const isLastColumn = colIndex === map.width - 1;
        const shouldKeepNull = isLastColumn && isLastColSelected && isFullWidth && hasNullWidth;
        tr.setNodeMarkup(pos, undefined, {
          ...cell.attrs,
          colwidth: shouldKeepNull ? null : [evenWidth]
        });
      });
    }
    dispatch(tr);
    return true;
  };
}

/**
 * Determines whether the width of a specified column is null.
 *
 * @param state - The current editor state.
 * @param colIndex - The index of the column to check.
 *
 * @returns {boolean} True if the column width is null, false otherwise.
 */
function isNullWidth(_ref3) {
  let {
    state,
    colIndex
  } = _ref3;
  const firstRowCells = (0, _table.getCellsInRow)(0)(state);
  const cell = firstRowCells?.[colIndex] !== undefined ? state.doc.nodeAt(firstRowCells[colIndex]) : null;
  const colwidth = cell?.attrs.colwidth;
  return !colwidth?.[0];
}
function sortTable(_ref4) {
  let {
    index,
    direction
  } = _ref4;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }

    // Cannot sort tables with rowspan as it would break the table structure
    if ((0, _table.tableHasRowspan)(state)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);

      // Build rows with both:
      // - columnMap: maps column index to cell (for sorting lookup, handles colspan)
      // - cells: unique cells in order (for row reconstruction)

      const rows = [];
      for (let r = 0; r < rect.map.height; r++) {
        const columnMap = new Map();
        const cells = [];
        const seenPositions = new Set();
        for (let c = 0; c < rect.map.width; c++) {
          const pos = rect.map.map[r * rect.map.width + c];
          const cell = state.doc.nodeAt(rect.tableStart + pos);
          if (cell) {
            // Map this column index to its cell (for sorting lookup)
            columnMap.set(c, cell);

            // Only add each unique cell once to the cells array (for row reconstruction)
            if (!seenPositions.has(pos)) {
              seenPositions.add(pos);
              cells.push(cell);
            }
          }
        }
        rows.push({
          columnMap,
          cells
        });
      }
      const hasHeaderRow = rows[0].cells.every(cell => cell.type === state.schema.nodes.th);

      // remove the header row
      const header = hasHeaderRow ? rows.shift() : undefined;

      // Helper to get cell content at column index
      const getCellContent = row => row.columnMap.get(index)?.textContent ?? "";

      // column data before sort
      const columnData = rows.map(getCellContent);

      // determine sorting type: date, currency, IP address, number, or text
      let compareAsDate = false;
      let compareAsCurrency = false;
      let compareAsIP = false;
      let compareAsNumber = false;
      const nonEmptyCells = columnData.map(content => content.trim()).filter(content => content.length > 0);
      if (nonEmptyCells.length > 0) {
        // Dates require every cell to match; `every` short-circuits on the first
        // miss, so the expensive date parsing is skipped for non-date columns.
        compareAsDate = nonEmptyCells.every(cell => (0, _date.parseDate)(cell) !== null);
        if (!compareAsDate) {
          // Tally the remaining candidate types in a single pass. The checks are
          // mutually exclusive and ordered by priority — IP must come before the
          // number check, as IPs would otherwise be parsed as truncated numbers.
          let currencyCount = 0;
          let ipCount = 0;
          let numberCount = 0;
          for (const cell of nonEmptyCells) {
            if ((0, _currency.isCurrency)(cell)) {
              currencyCount++;
            } else if ((0, _ip.isIPv4Address)(cell)) {
              ipCount++;
            } else if (!isNaN(parseFloat(cell))) {
              numberCount++;
            }
          }

          // Treat as a type if at least 2 cells match and they form a majority.
          const isMajority = count => count >= 2 && count / nonEmptyCells.length >= 0.5;
          if (isMajority(currencyCount)) {
            compareAsCurrency = true;
          } else if (isMajority(ipCount)) {
            compareAsIP = true;
          } else if (isMajority(numberCount)) {
            compareAsNumber = true;
          }
        }
      }

      // Extracts a comparable value for the detected column type. Returns null
      // for empty or non-matching cells, which always sort to the end.
      const getSortValue = content => {
        if (!content) {
          return null;
        }
        if (compareAsDate) {
          return (0, _date.parseDate)(content)?.getTime() ?? null;
        }
        if (compareAsCurrency) {
          return (0, _currency.parseCurrency)(content);
        }
        if (compareAsIP) {
          return (0, _ip.parseIPv4)(content);
        }
        if (compareAsNumber) {
          const num = parseFloat(content);
          return isNaN(num) ? null : num;
        }
        return content;
      };

      // Sort rows based on column at index. The comparator is direction-aware
      // rather than reversing afterwards, so the sort stays stable in both
      // directions — equal cells keep their prior order, which lets sorts be
      // chained to build a multi-key order (e.g. sort by IP, then by VLAN).
      const directionMultiplier = direction === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const aValue = getSortValue(getCellContent(a));
        const bValue = getSortValue(getCellContent(b));

        // empty or non-matching cells always go to the end, regardless of direction
        if (aValue === null) {
          return bValue === null ? 0 : 1;
        }
        if (bValue === null) {
          return -1;
        }
        const result = typeof aValue === "string" ? aValue.localeCompare(bValue) : aValue - bValue;
        return directionMultiplier * result;
      });

      // check if column data changed, if not then do not replace table
      if (columnData.join() === rows.map(getCellContent).join()) {
        return true;
      }

      // add the header row back
      if (header) {
        rows.unshift(header);
      }

      // create the new table
      const tableRows = [];
      for (let i = 0; i < rows.length; i += 1) {
        tableRows.push(state.schema.nodes.tr.createChecked(null, rows[i].cells));
      }

      // replace the original table with this sorted one
      const nodes = state.schema.nodes.table.createChecked(rect.table.attrs, tableRows);
      const {
        tr
      } = state;
      tr.replaceRangeWith(rect.tableStart - 1, rect.tableStart - 1 + rect.table.nodeSize, nodes);
      restoreColumnSelection(tr, rect.tableStart, index);
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/**
 * A command that safely adds a row taking into account any existing heading column at the top of
 * the table, and preventing it moving "into" the table.
 *
 * @param index The index to add the row at, if undefined the current selection is used
 * @returns The command
 */
function addRowBefore(_ref5) {
  let {
    index
  } = _ref5;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const isHeaderRowEnabled = (0, _table.isHeaderEnabled)(state, "row", rect);
    const position = index !== undefined ? index : rect.left;

    // Special case when adding row to the beginning of the table to ensure the header does not
    // move inwards.
    const headerSpecialCase = position === 0 && isHeaderRowEnabled;

    // Determine which row to copy alignment from (using original table indices)
    // When inserting at position 0, copy from original row 0
    // When inserting at other positions, copy from the row above (position - 1)
    const copyFromRow = position === 0 ? 0 : position - 1;
    (0, _chainTransactions.chainTransactions)(headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("row") : undefined, (s, d) => !!d?.(addRowWithAlignment(s.tr, rect, position, copyFromRow, s)), headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("row") : undefined, setCursorInCell(rect.tableStart, position, 0))(state, dispatch);
    return true;
  };
}

/**
 * A command that deletes the current selected row, if any.
 *
 * @returns The command
 */
function deleteRowSelection() {
  return (state, dispatch) => {
    if (state.selection instanceof _prosemirrorTables.CellSelection && state.selection.isRowSelection()) {
      return (0, _prosemirrorTables.deleteRow)(state, dispatch);
    }
    return false;
  };
}

/**
 * A command that deletes the current selected column, if any.
 *
 * @returns The command
 */
function deleteColSelection() {
  return (state, dispatch) => {
    if (state.selection instanceof _prosemirrorTables.CellSelection && state.selection.isColSelection()) {
      return (0, _prosemirrorTables.deleteColumn)(state, dispatch);
    }
    return false;
  };
}

/**
 * A command that safely adds a column taking into account any existing heading column on the far
 * left of the table, and preventing it moving "into" the table.
 *
 * @param index The index to add the column at, if undefined the current selection is used
 * @returns The command
 */
function addColumnBefore(_ref6) {
  let {
    index
  } = _ref6;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const isHeaderColumnEnabled = (0, _table.isHeaderEnabled)(state, "column", rect);
    const position = index !== undefined ? index : rect.left;

    // Special case when adding column to the beginning of the table to ensure the header does not
    // move inwards.
    const headerSpecialCase = position === 0 && isHeaderColumnEnabled;
    (0, _chainTransactions.chainTransactions)(headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("column") : undefined, (s, d) => !!d?.((0, _prosemirrorTables.addColumn)(s.tr, rect, position)), headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("column") : undefined, setCursorInCell(rect.tableStart, 0, position))(state, dispatch);
    return true;
  };
}

/**
 * A command that adds a row after the given index (or the current selection),
 * copying alignment from the row above and placing the cursor in the new row.
 *
 * @param index The index of the row to add after, if undefined the current selection is used
 * @returns The command
 */
function addRowAfter(_ref7) {
  let {
    index
  } = _ref7;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const position = index !== undefined ? index + 1 : rect.bottom;

    // Copy alignment from the row above the insertion point.
    const copyFromRow = position - 1;
    (0, _chainTransactions.chainTransactions)((s, d) => !!d?.(addRowWithAlignment(s.tr, rect, position, copyFromRow, s)), setCursorInCell(rect.tableStart, position, 0))(state, dispatch);
    return true;
  };
}

/**
 * A command that adds a column after the given index (or the current selection),
 * placing the cursor in the new column.
 *
 * @param index The index of the column to add after, if undefined the current selection is used
 * @returns The command
 */
function addColumnAfter(_ref8) {
  let {
    index
  } = _ref8;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const position = index !== undefined ? index + 1 : rect.right;
    (0, _chainTransactions.chainTransactions)((s, d) => !!d?.((0, _prosemirrorTables.addColumn)(s.tr, rect, position)), setCursorInCell(rect.tableStart, 0, position))(state, dispatch);
    return true;
  };
}
function addRowAndMoveSelection() {
  let {
    index
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (state, dispatch, view) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const cells = (0, _table.getCellsInColumn)(0)(state);

    // If the cursor is at the beginning of the first column then insert row
    // above instead of below.
    if (rect.left === 0 && view?.endOfTextblock("backward", state)) {
      const indexBefore = index !== undefined ? index - 1 : rect.top;
      // Copy alignment from the current row (which will be pushed down)
      const copyFromRow = indexBefore;
      dispatch?.(addRowWithAlignment(state.tr, rect, indexBefore, copyFromRow, state));
      return true;
    }
    const indexAfter = index !== undefined ? index + 1 : rect.bottom;
    // Copy alignment from the row above the insertion point
    const copyFromRow = indexAfter > 0 ? indexAfter - 1 : undefined;
    const tr = addRowWithAlignment(state.tr, rect, indexAfter, copyFromRow, state);

    // Special case when adding row to the end of the table as the calculated
    // rect does not include the row that we just added.
    if (indexAfter !== rect.map.height) {
      const pos = cells[Math.min(cells.length - 1, indexAfter)];
      const $pos = tr.doc.resolve(pos);
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near($pos)));
    } else {
      const $pos = tr.doc.resolve(rect.tableStart + rect.table.nodeSize);
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near($pos)));
    }
    return true;
  };
}

/**
 * Set column attributes. Passed attributes will be merged with existing.
 *
 * @param attrs The attributes to set
 * @returns The command
 */
function setColumnAttr(_ref9) {
  let {
    index,
    alignment
  } = _ref9;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      // Apply to every selected column so that aligning a span of columns – or a
      // column whose header cell spans multiple columns – affects all of them,
      // not just the first.
      const cells = (0, _table.getCellsInSelectedColumns)(state, index);
      let tr = state.tr;
      cells.forEach(pos => {
        const node = state.doc.nodeAt(pos);
        tr = tr.setNodeMarkup(pos, undefined, {
          ...node?.attrs,
          alignment
        });
      });
      restoreColumnSelection(tr, rect.tableStart, index);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Set table attributes. Passed attributes will be merged with existing.
 *
 * @param attrs The attributes to set
 * @returns The command
 */
function setTableAttr(attrs) {
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const {
        tr
      } = state;
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      tr.setNodeMarkup(rect.tableStart - 1, undefined, {
        ...rect.table.attrs,
        ...attrs
      }).setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(rect.tableStart)));
      dispatch(tr);
      return true;
    }
    return false;
  };
}
function selectRow(index) {
  let expand = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const pos = rect.map.positionAt(index, 0, rect.table);
      const $pos = state.doc.resolve(rect.tableStart + pos);
      const rowSelection = expand && state.selection instanceof _prosemirrorTables.CellSelection ? _RowSelection.RowSelection.rowSelection(state.selection.$anchorCell, $pos, index) : _RowSelection.RowSelection.rowSelection($pos, $pos, index);
      dispatch(state.tr.setSelection(rowSelection));
      return true;
    }
    return false;
  };
}
function selectColumn(index) {
  let expand = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const pos = rect.map.positionAt(0, index, rect.table);
      const $pos = state.doc.resolve(rect.tableStart + pos);
      const colSelection = expand && state.selection instanceof _prosemirrorTables.CellSelection ? _ColumnSelection.ColumnSelection.colSelection(state.selection.$anchorCell, $pos) : _ColumnSelection.ColumnSelection.colSelection($pos);
      dispatch(state.tr.setSelection(colSelection));
      return true;
    }
    return false;
  };
}
function selectTable() {
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const map = rect.map.map;
      const $anchor = state.doc.resolve(rect.tableStart + map[0]);
      const $head = state.doc.resolve(rect.tableStart + map[map.length - 1]);
      const tableSelection = new _prosemirrorTables.CellSelection($anchor, $head);
      dispatch(state.tr.setSelection(tableSelection));
      return true;
    }
    return false;
  };
}
function moveOutOfTable(direction) {
  return (state, dispatch) => {
    if (dispatch) {
      if (state.selection instanceof _prosemirrorGapcursor.GapCursor) {
        return false;
      }
      if (!(0, _prosemirrorTables.isInTable)(state)) {
        return false;
      }

      // check if current cursor position is at the top or bottom of the table
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const topOfTable = rect.top === 0 && rect.bottom === 1 && direction === -1;
      const bottomOfTable = rect.top === rect.map.height - 1 && rect.bottom === rect.map.height && direction === 1;
      if (!topOfTable && !bottomOfTable) {
        return false;
      }
      const map = rect.map.map;
      const $start = state.doc.resolve(rect.tableStart + map[0] - 1);
      const $end = state.doc.resolve(rect.tableStart + map[map.length - 1] + 2);

      // @ts-expect-error findGapCursorFrom is a ProseMirror internal method.
      const $found = _prosemirrorGapcursor.GapCursor.findGapCursorFrom(direction > 0 ? $end : $start, direction, true);
      if ($found) {
        dispatch(state.tr.setSelection(new _prosemirrorGapcursor.GapCursor($found)));
        return true;
      }
    }
    return false;
  };
}

/**
 * A command that deletes the entire table if all cells are selected.
 *
 * @returns The command
 */
function deleteTableIfSelected() {
  return (state, dispatch) => {
    if ((0, _table.isTableSelected)(state)) {
      return (0, _prosemirrorTables.deleteTable)(state, dispatch);
    }
    return false;
  };
}
function deleteCellSelection(state, dispatch) {
  const sel = state.selection;
  if (!(sel instanceof _prosemirrorTables.CellSelection)) {
    return false;
  }
  if (dispatch) {
    const tr = state.tr;
    const baseContent = (0, _prosemirrorTables.tableNodeTypes)(state.schema).cell.createAndFill().content;
    sel.forEachCell((cell, pos) => {
      if (!cell.content.eq(baseContent)) {
        tr.replace(tr.mapping.map(pos + 1), tr.mapping.map(pos + cell.nodeSize - 1), new _prosemirrorModel.Slice(baseContent, 0, 0));
      }
    });
    if (tr.docChanged) {
      dispatch(tr);
      return true;
    }
  }
  return false;
}

/**
 * A command that splits the first merged cell found in the selection and
 * collapses the selection. Works with both single cell and multi-cell selections.
 *
 * @returns The command
 */
function splitCellAndCollapse() {
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const {
      selection
    } = state;

    // Handle CellSelection (including RowSelection and ColumnSelection which extend it)
    if (selection instanceof _prosemirrorTables.CellSelection || selection instanceof _RowSelection.RowSelection || selection instanceof _ColumnSelection.ColumnSelection) {
      // Find the first merged cell in the selection
      let mergedCellPos = null;
      selection.forEachCell((cell, pos) => {
        if (mergedCellPos === null && (cell.attrs.colspan > 1 || cell.attrs.rowspan > 1)) {
          mergedCellPos = pos;
        }
      });

      // If no merged cell found, nothing to split
      if (mergedCellPos === null) {
        return false;
      }
      if (dispatch) {
        // Create a CellSelection for the merged cell and apply splitCell
        const $cell = state.doc.resolve(mergedCellPos);
        const cellSelection = new _prosemirrorTables.CellSelection($cell);
        const stateWithCellSelection = state.apply(state.tr.setSelection(cellSelection));

        // Apply splitCell and collapse
        (0, _chainTransactions.chainTransactions)(_prosemirrorTables.splitCell, (0, _collapseSelection.collapseSelection)())(stateWithCellSelection, dispatch);
      }
      return true;
    }

    // Fallback to standard splitCell for non-cell selections
    return (0, _chainTransactions.chainTransactions)(_prosemirrorTables.splitCell, (0, _collapseSelection.collapseSelection)())(state, dispatch);
  };
}

/**
 * Helper function to add a row while copying alignment attributes from an existing row.
 *
 * @param tr The transaction
 * @param rect The table rect
 * @param index The index where to insert the row
 * @param copyFromRow The row index to copy alignment from (optional)
 * @param state The editor state
 * @returns The modified transaction
 */
function addRowWithAlignment(tr, rect, index, copyFromRow, state) {
  // Get alignment attributes from the source row BEFORE inserting the new row
  let sourceRowAlignments;
  if (copyFromRow !== undefined && copyFromRow >= 0 && copyFromRow < rect.map.height) {
    const cellsInSourceRow = (0, _table.getCellsInRow)(copyFromRow)(state);
    if (cellsInSourceRow) {
      sourceRowAlignments = cellsInSourceRow.map(pos => {
        const node = tr.doc.nodeAt(pos);
        return node?.attrs.alignment || null;
      });
    }
  }

  // Now add the row using the standard prosemirror function
  const newTr = (0, _prosemirrorTables.addRow)(tr, rect, index);

  // Apply the copied alignments to the new row
  if (sourceRowAlignments) {
    const newState = state.apply(newTr);
    const cellsInNewRow = (0, _table.getCellsInRow)(index)(newState);
    if (cellsInNewRow) {
      cellsInNewRow.forEach((newCellPos, colIndex) => {
        if (colIndex < sourceRowAlignments.length && sourceRowAlignments[colIndex]) {
          const newCellNode = newTr.doc.nodeAt(newCellPos);
          if (newCellNode) {
            const attrs = {
              ...newCellNode.attrs,
              alignment: sourceRowAlignments[colIndex]
            };
            newTr.setNodeMarkup(newCellPos, undefined, attrs);
          }
        }
      });
    }
  }
  return newTr;
}

/**
 * A command that merges selected cells and collapses the selection.
 *
 * @returns The command
 */
function mergeCellsAndCollapse() {
  return (0, _chainTransactions.chainTransactions)(_prosemirrorTables.mergeCells, (0, _collapseSelection.collapseSelection)());
}
const updateCellBackground = (cell, pos, attrs, tr) => {
  const existingMarks = cell.attrs.marks ?? [];
  const backgroundMark = (0, _compat.find)(existingMarks, m => m.type === "background");
  const updatedMarks = !backgroundMark ? [...existingMarks, {
    type: "background",
    attrs
  }] : existingMarks.map(mark => mark.type === "background" ? {
    ...mark,
    attrs: {
      ...mark.attrs,
      ...attrs
    }
  } : mark);
  return tr.setNodeAttribute(pos, "marks", updatedMarks);
};
const removeCellBackground = (cell, pos, tr) => {
  const existingMarks = cell.attrs.marks ?? [];
  const updatedMarks = existingMarks.filter(mark => mark.type !== "background");
  return tr.setNodeAttribute(pos, "marks", updatedMarks);
};
const toggleCellSelectionBackgroundAndCollapseSelection = _ref0 => {
  let {
    color
  } = _ref0;
  return (0, _chainTransactions.chainTransactions)(toggleCellSelectionBackground({
    color
  }), (0, _collapseSelection.collapseSelection)());
};
exports.toggleCellSelectionBackgroundAndCollapseSelection = toggleCellSelectionBackgroundAndCollapseSelection;
const toggleRowBackgroundAndCollapseSelection = _ref1 => {
  let {
    color
  } = _ref1;
  return (0, _chainTransactions.chainTransactions)(toggleRowBackground({
    color
  }), (0, _collapseSelection.collapseSelection)());
};
exports.toggleRowBackgroundAndCollapseSelection = toggleRowBackgroundAndCollapseSelection;
const toggleColumnBackgroundAndCollapseSelection = _ref10 => {
  let {
    color
  } = _ref10;
  return (0, _chainTransactions.chainTransactions)(toggleColumnBackground({
    color
  }), (0, _collapseSelection.collapseSelection)());
};
exports.toggleColumnBackgroundAndCollapseSelection = toggleColumnBackgroundAndCollapseSelection;
const toggleCellSelectionBackground = _ref11 => {
  let {
    color
  } = _ref11;
  return (state, dispatch) => {
    if (!(state.selection instanceof _prosemirrorTables.CellSelection)) {
      return false;
    }
    let tr = state.tr;
    state.selection.forEachCell((cell, pos) => {
      if (color === null) {
        tr = removeCellBackground(cell, pos, tr);
      } else {
        tr = updateCellBackground(cell, pos, {
          color
        }, tr);
      }
    });
    dispatch?.(tr);
    return true;
  };
};

/**
 * Set background color on all cells in a row.
 *
 * @param color The background color to set, or null to remove
 * @returns The command
 */
exports.toggleCellSelectionBackground = toggleCellSelectionBackground;
function toggleRowBackground(_ref12) {
  let {
    color
  } = _ref12;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rowIndex = (0, _table.getRowIndex)(state);
    if ((0, _compat.isUndefined)(rowIndex)) {
      return false;
    }
    if (dispatch) {
      // Apply to every selected row so that coloring a span of rows – or a row
      // whose cell spans multiple rows – affects all of them, not just the first.
      const cells = (0, _table.getCellsInSelectedRows)(state, rowIndex);
      let tr = state.tr;
      cells.forEach(pos => {
        const node = state.doc.nodeAt(pos);
        if (!node) {
          return;
        }
        if (color === null) {
          tr = removeCellBackground(node, pos, tr);
        } else {
          tr = updateCellBackground(node, pos, {
            color
          }, tr);
        }
      });

      // It was noticed that the selection went to the last table cell of the
      // row after command execution.
      // Instead, we want to preserve the original row selection so that the color
      // picker can be prevented from closing.
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const pos = rect.map.positionAt(rowIndex, 0, rect.table);
      const $pos = tr.doc.resolve(rect.tableStart + pos);
      tr.setSelection(_RowSelection.RowSelection.rowSelection($pos, $pos, rowIndex));
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Set background color on all cells in a column.
 *
 * @param color The background color to set, or null to remove
 * @returns The command
 */
function toggleColumnBackground(_ref13) {
  let {
    color
  } = _ref13;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const colIndex = (0, _table.getColumnIndex)(state);
    if ((0, _compat.isUndefined)(colIndex)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      // Apply to every selected column so that coloring a span of columns – or a
      // column whose header cell spans multiple columns – affects all of them,
      // not just the first.
      const cells = (0, _table.getCellsInSelectedColumns)(state, colIndex);
      let tr = state.tr;
      cells.forEach(pos => {
        const node = state.doc.nodeAt(pos);
        if (!node) {
          return;
        }
        if (color === null) {
          tr = removeCellBackground(node, pos, tr);
        } else {
          tr = updateCellBackground(node, pos, {
            color
          }, tr);
        }
      });
      restoreColumnSelection(tr, rect.tableStart, colIndex);
      dispatch(tr);
    }
    return true;
  };
}