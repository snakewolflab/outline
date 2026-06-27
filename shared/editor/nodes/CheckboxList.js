"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _listInputRule = require("../lib/listInputRule");
var _findChildren = require("../queries/findChildren");
var _CheckboxListView = require("./CheckboxListView");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CheckboxList extends _Node.default {
  get name() {
    return "checkbox_list";
  }
  get schema() {
    return {
      group: "block list",
      content: "checkbox_item+",
      attrs: {
        id: {
          default: null
        }
      },
      toDOM: () => ["ul", {
        class: this.name
      }, 0],
      parseDOM: [{
        tag: `[class="${this.name}"]`
      }]
    };
  }
  get plugins() {
    const userIdentifier = this.editor.props.userId;

    // Plugin to auto-assign IDs to checkbox lists
    const assignIdsPlugin = new _prosemirrorState.Plugin({
      appendTransaction: (txs, _oldSt, newSt) => {
        const hasDocChanges = txs.some(t => t.docChanged);
        if (!hasDocChanges) {
          return null;
        }
        const checkboxLists = (0, _findChildren.findBlockNodes)(newSt.doc, true).filter(b => b.node.type.name === this.name && !b.node.attrs.id);
        if (checkboxLists.length === 0) {
          return null;
        }
        let modifyTx = newSt.tr;
        checkboxLists.forEach(listBlock => {
          modifyTx.setNodeAttribute(listBlock.pos, "id", (0, _uuid.v4)());
        });
        return modifyTx;
      }
    });

    // Plugin to provide NodeViews
    const nodeViewPlugin = new _prosemirrorState.Plugin({
      props: {
        nodeViews: {
          [this.name]: (node, view, getPos) => new _CheckboxListView.CheckboxListView(node, view, getPos, userIdentifier || "")
        }
      }
    });
    return [assignIdsPlugin, nodeViewPlugin];
  }
  keys(_ref) {
    let {
      type,
      schema
    } = _ref;
    return {
      "Shift-Ctrl-7": (0, _toggleList.default)(type, schema.nodes.checkbox_item)
    };
  }
  commands(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    return () => (0, _toggleList.default)(type, schema.nodes.checkbox_item);
  }
  inputRules(_ref3) {
    let {
      type,
      schema
    } = _ref3;
    const pattern = /^-?\s*(\[\s?\])\s$/i;
    return [
    // Convert an existing plain list to a checklist, keeping nesting intact.
    (0, _listInputRule.checkboxListInputRule)(pattern, type, schema.nodes.checkbox_item),
    // Wrap a plain paragraph into a new checklist.
    (0, _listInputRule.listWrappingInputRule)(pattern, type)];
  }
  toMarkdown(state, node) {
    state.renderList(node, "  ", () => "- ");
  }
  parseMarkdown() {
    return {
      block: "checkbox_list"
    };
  }
}
exports.default = CheckboxList;