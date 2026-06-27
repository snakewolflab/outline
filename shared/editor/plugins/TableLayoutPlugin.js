"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TableLayoutPlugin = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _changedDescendants = require("../lib/changedDescendants");
/**
 * A ProseMirror plugin that watches for changes to the "layout" attribute on tables
 * and removes the width attribute from all cells in the last column when it changes.
 */
class TableLayoutPlugin extends _prosemirrorState.Plugin {
  constructor() {
    super({
      appendTransaction: (transactions, oldState, newState) => {
        let tr;
        const check = (node, pos) => {
          if (node.type.spec.tableRole === "table") {
            tr = this.handleTableLayoutChange(oldState, newState, node, pos, tr);
          }
        };
        if (!oldState) {
          // Initial state - check all tables
          newState.doc.descendants(check);
        } else if (oldState.doc !== newState.doc) {
          // Document changed - check only changed tables
          (0, _changedDescendants.changedDescendants)(oldState.doc, newState.doc, 0, check);
        }
        return tr;
      }
    });
  }
  handleTableLayoutChange(oldState, newState, table, pos, tr) {
    if (!oldState) {
      // Initial state - no comparison needed
      return tr;
    }
    let oldTable;
    try {
      // Find the corresponding table in the old state
      oldTable = oldState.doc.nodeAt(pos);
    } catch {
      // If we can't find the old table, just return the transaction as is
      return tr;
    }
    if (!oldTable || oldTable.type !== table.type) {
      return tr;
    }

    // Check if the layout attribute has changed
    const oldLayout = oldTable.attrs.layout;
    const newLayout = table.attrs.layout;
    if (oldLayout === newLayout) {
      // No layout change
      return tr;
    }

    // Layout has changed - remove width from last column cells
    const map = _prosemirrorTables.TableMap.get(table);
    const lastColumnIndex = map.width - 1;
    if (lastColumnIndex < 0) {
      // No columns in table
      return tr;
    }

    // Create transaction if it doesn't exist
    if (!tr) {
      tr = newState.tr;
    }

    // Create a temporary state to use getCellsInColumn
    const tableStart = pos + 1;
    const cellPositions = [];

    // Manually calculate cell positions in the last column
    for (let row = 0; row < map.height; row++) {
      const cellIndex = row * map.width + lastColumnIndex;
      if (cellIndex < map.map.length) {
        const cellPos = tableStart + map.map[cellIndex];
        // Avoid duplicates from merged cells
        if (!cellPositions.includes(cellPos)) {
          cellPositions.push(cellPos);
        }
      }
    }

    // Remove colwidth attribute from each cell in the last column
    cellPositions.forEach(cellPos => {
      const cell = newState.doc.nodeAt(cellPos);
      if (cell && cell.attrs.colwidth) {
        const newAttrs = {
          ...cell.attrs
        };
        delete newAttrs.colwidth;
        tr = tr.setNodeMarkup(cellPos, undefined, newAttrs);
      }
    });
    return tr;
  }
}
exports.TableLayoutPlugin = TableLayoutPlugin;