"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _table = require("../commands/table");
var _FixTablesPlugin = require("../plugins/FixTablesPlugin");
var _TableLayoutPlugin = require("../plugins/TableLayoutPlugin");
var _tables = _interopRequireDefault(require("../rules/tables"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _Node = _interopRequireDefault(require("./Node"));
var _TableView = require("./TableView");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Table extends _Node.default {
  get name() {
    return "table";
  }
  get schema() {
    return {
      content: "tr+",
      tableRole: "table",
      isolating: true,
      group: "block",
      parseDOM: [{
        tag: "table"
      }],
      attrs: {
        layout: {
          default: null
        }
      },
      toDOM() {
        // Note: This is overridden by TableView
        return ["div", {
          class: _EditorStyleHelper.EditorStyleHelper.table
        }, ["table", {}, ["tbody", 0]]];
      }
    };
  }
  get rulePlugins() {
    return [_tables.default];
  }
  commands() {
    return {
      createTable: _table.createTable,
      setColumnAttr: _table.setColumnAttr,
      setTableAttr: _table.setTableAttr,
      sortTable: _table.sortTable,
      addColumnBefore: _table.addColumnBefore,
      addColumnAfter: _table.addColumnAfter,
      deleteColumn: () => _prosemirrorTables.deleteColumn,
      addRowBefore: _table.addRowBefore,
      addRowAfter: _table.addRowAfter,
      moveTableRow: _prosemirrorTables.moveTableRow,
      moveTableColumn: _prosemirrorTables.moveTableColumn,
      deleteRow: () => _prosemirrorTables.deleteRow,
      deleteTable: () => _prosemirrorTables.deleteTable,
      exportTable: _table.exportTable,
      distributeColumns: _table.distributeColumns,
      toggleHeaderColumn: () => (0, _prosemirrorTables.toggleHeader)("column"),
      toggleHeaderRow: () => (0, _prosemirrorTables.toggleHeader)("row"),
      mergeCells: () => (0, _table.mergeCellsAndCollapse)(),
      splitCell: () => (0, _table.splitCellAndCollapse)(),
      toggleRowBackground: _table.toggleRowBackground,
      toggleRowBackgroundAndCollapseSelection: _table.toggleRowBackgroundAndCollapseSelection,
      toggleColumnBackground: _table.toggleColumnBackground,
      toggleColumnBackgroundAndCollapseSelection: _table.toggleColumnBackgroundAndCollapseSelection,
      toggleCellSelectionBackground: _table.toggleCellSelectionBackground,
      toggleCellSelectionBackgroundAndCollapseSelection: _table.toggleCellSelectionBackgroundAndCollapseSelection
    };
  }
  keys() {
    return {
      Tab: (0, _prosemirrorCommands.chainCommands)((0, _prosemirrorTables.goToNextCell)(1), (0, _table.addRowAndMoveSelection)()),
      "Shift-Tab": (0, _prosemirrorTables.goToNextCell)(-1),
      "Mod-Enter": (0, _table.addRowAndMoveSelection)(),
      "Mod-Backspace": (0, _prosemirrorCommands.chainCommands)(_table.deleteCellSelection, (0, _table.deleteColSelection)(), (0, _table.deleteRowSelection)(), (0, _table.deleteTableIfSelected)()),
      Backspace: (0, _prosemirrorCommands.chainCommands)(_table.deleteCellSelection, (0, _table.deleteColSelection)(), (0, _table.deleteRowSelection)(), (0, _table.deleteTableIfSelected)()),
      ArrowDown: (0, _table.moveOutOfTable)(1),
      ArrowUp: (0, _table.moveOutOfTable)(-1)
    };
  }
  inputRules() {
    return [new _prosemirrorInputrules.InputRule(/^(\|--)$/, (state, _, start, end) => {
      const nodes = (0, _table.createTableInner)(state, 2, 2);
      const tr = state.tr.replaceWith(start - 1, end, nodes).scrollIntoView();
      const resolvedPos = tr.doc.resolve(start + 1);
      tr.setSelection(_prosemirrorState.TextSelection.near(resolvedPos));
      return tr;
    })];
  }
  toMarkdown(state, node) {
    state.renderTable(node);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      block: "table"
    };
  }
  get plugins() {
    return [
    // Note: Important to register columnResizing before tableEditing
    (0, _prosemirrorTables.columnResizing)({
      View: _TableView.TableView,
      defaultCellMinWidth: 25
    }), (0, _prosemirrorTables.tableEditing)(), new _FixTablesPlugin.FixTablesPlugin(), new _TableLayoutPlugin.TableLayoutPlugin()];
  }
}
exports.default = Table;