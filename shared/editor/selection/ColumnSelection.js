"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColumnSelection = exports.ColumnBookmark = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
class ColumnSelection extends _prosemirrorTables.CellSelection {
  getBookmark() {
    return new ColumnBookmark(this.$anchorCell.pos, this.$headCell.pos);
  }
  static colSelection($anchorCell) {
    let $headCell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $anchorCell;
    const table = $anchorCell.node(-1);
    const map = _prosemirrorTables.TableMap.get(table);
    const tableStart = $anchorCell.start(-1);
    const anchorRect = map.findCell($anchorCell.pos - tableStart);
    const headRect = map.findCell($headCell.pos - tableStart);
    const doc = $anchorCell.node(0);
    if (anchorRect.top <= headRect.top) {
      if (anchorRect.top > 0) {
        $anchorCell = doc.resolve(tableStart + map.map[anchorRect.left]);
      }
      if (headRect.bottom < map.height) {
        $headCell = doc.resolve(tableStart + map.map[map.width * (map.height - 1) + headRect.right - 1]);
      }
    } else {
      if (headRect.top > 0) {
        $headCell = doc.resolve(tableStart + map.map[headRect.left]);
      }
      if (anchorRect.bottom < map.height) {
        $anchorCell = doc.resolve(tableStart + map.map[map.width * (map.height - 1) + anchorRect.right - 1]);
      }
    }
    return new ColumnSelection($anchorCell, $headCell);
  }
}
exports.ColumnSelection = ColumnSelection;
class ColumnBookmark {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }
  map(mapping) {
    return new ColumnBookmark(mapping.map(this.anchor), mapping.map(this.head));
  }
  resolve(doc) {
    const $anchorCell = doc.resolve(this.anchor),
      $headCell = doc.resolve(this.head);
    if ($anchorCell.parent.type.spec.tableRole === "row" && $headCell.parent.type.spec.tableRole === "row" && $anchorCell.index() < $anchorCell.parent.childCount && $headCell.index() < $headCell.parent.childCount && (0, _prosemirrorTables.inSameTable)($anchorCell, $headCell)) {
      return new ColumnSelection($anchorCell, $headCell);
    } else {
      return _prosemirrorState.Selection.near($headCell, 1);
    }
  }
}
exports.ColumnBookmark = ColumnBookmark;