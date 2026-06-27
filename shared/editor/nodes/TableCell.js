"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _prosemirrorTables = require("prosemirror-tables");
var _table = require("../lib/table");
var _Node = _interopRequireDefault(require("./Node"));
var _color = require("../../utils/color");
var _polished = require("polished");
var _TableCell;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class TableCell extends _Node.default {
  /**
   * Checks if a color is one of the table cell preset colors.
   *
   * @param color - A hex color string to check.
   * @returns true if the color matches a preset color's hex value.
   */
  static isPresetColor(color) {
    return TableCell.presetColors.some(c => c.hex === color);
  }
  get name() {
    return "td";
  }
  get schema() {
    return {
      content: "block+",
      tableRole: "cell",
      group: "cell",
      isolating: true,
      parseDOM: [{
        tag: "td",
        getAttrs: _table.getCellAttrs
      }],
      toDOM(node) {
        return ["td", (0, _table.setCellAttrs)(node), 0];
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
          validate: _table.isValidCellAlignment
        },
        colwidth: {
          default: null
        },
        marks: {
          default: undefined,
          validate: value => (0, _table.isValidCellMarks)(value, this.editor?.schema)
        }
      }
    };
  }
  toMarkdown() {
    // see: renderTable
  }
  parseMarkdown() {
    return {
      block: "td",
      getAttrs: tok => ({
        alignment: (0, _table.isValidCellAlignment)(tok.info) ? tok.info : null
      })
    };
  }
  get plugins() {
    const createCellDecorations = state => {
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
            if (cellNode.type.spec.tableRole === "cell" || cellNode.type.spec.tableRole === "header_cell") {
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
    return [new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("table-cell-attributes"),
      state: {
        init: (_, state) => createCellDecorations(state),
        apply: (tr, pluginState, oldState, newState) => {
          // Only recompute if document changed
          if (!tr.docChanged) {
            return pluginState;
          }
          return createCellDecorations(newState);
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      }
    }), new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("table-cell-copy-transform"),
      props: {
        transformCopied: slice => {
          // check if the copied selection is a single table, with a single row, with a single cell. If so,
          // copy the cell content only – not a table with a single cell. This leads to more predictable pasting
          // behavior, both in and outside the app.
          if (slice.content.childCount === 1) {
            const table = slice.content.firstChild;
            if (table?.type.spec.tableRole === "table" && table.childCount === 1) {
              const row = table.firstChild;
              if (row?.type.spec.tableRole === "row" && row.childCount === 1) {
                const cell = row.firstChild;
                if (cell?.type.spec.tableRole === "cell") {
                  return new _prosemirrorModel.Slice(cell.content, slice.openStart, slice.openEnd);
                }
              }
            }
          }
          return slice;
        }
      }
    })];
  }
}
exports.default = TableCell;
_TableCell = TableCell;
/** The default opacity of the table cell background */
_defineProperty(TableCell, "opacity", 0.7);
/** Preset colors with opacity applied, used for table cell backgrounds */
_defineProperty(TableCell, "presetColors", _color.presetColors.map(preset => ({
  hex: (0, _color.rgbaToHex)((0, _polished.parseToRgb)((0, _polished.transparentize)(1 - _TableCell.opacity, preset.hex))),
  name: preset.name
})));