"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RowSelection = exports.RowBookmark = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
class RowSelection extends _prosemirrorTables.CellSelection {
  constructor($anchorCell, $headCell) {
    let $index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    super($anchorCell, $headCell);
    this.$anchorCell = $anchorCell;
    this.$headCell = $headCell;
    this.$index = $index;
  }
  getBookmark() {
    return new RowBookmark(this.$anchorCell.pos, this.$headCell.pos, this.$index);
  }
  static rowSelection($anchorCell) {
    let $headCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $anchorCell;
    let $index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    const table = $anchorCell.node(-1);
    const map = _prosemirrorTables.TableMap.get(table);
    const tableStart = $anchorCell.start(-1);
    const anchorRect = map.findCell($anchorCell.pos - tableStart);
    const headRect = map.findCell($headCell.pos - tableStart);
    const doc = $anchorCell.node(0);
    if (anchorRect.left <= headRect.left) {
      if (anchorRect.left > 0) {
        $anchorCell = doc.resolve(tableStart + map.map[anchorRect.top * map.width]);
      }
      if (headRect.right < map.width) {
        $headCell = doc.resolve(tableStart + map.map[map.width * (headRect.top + 1) - 1]);
      }
    } else {
      if (headRect.left > 0) {
        $headCell = doc.resolve(tableStart + map.map[headRect.top * map.width]);
      }
      if (anchorRect.right < map.width) {
        $anchorCell = doc.resolve(tableStart + map.map[map.width * (anchorRect.top + 1) - 1]);
      }
    }
    return new RowSelection($anchorCell, $headCell, $index);
  }
}
exports.RowSelection = RowSelection;
class RowBookmark {
  constructor(anchor, head) {
    let index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    this.anchor = anchor;
    this.head = head;
    this.index = index;
  }
  map(mapping) {
    return new RowBookmark(mapping.map(this.anchor), mapping.map(this.head), this.index);
  }
  resolve(doc) {
    const $anchorCell = doc.resolve(this.anchor),
      $headCell = doc.resolve(this.head);
    if ($anchorCell.parent.type.spec.tableRole === "row" && $headCell.parent.type.spec.tableRole === "row" && $anchorCell.index() < $anchorCell.parent.childCount && $headCell.index() < $headCell.parent.childCount && (0, _prosemirrorTables.inSameTable)($anchorCell, $headCell)) {
      return new RowSelection($anchorCell, $headCell);
    } else {
      return _prosemirrorState.Selection.near($headCell, 1);
    }
  }
}
exports.RowBookmark = RowBookmark;