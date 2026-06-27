"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorSchemaList = require("prosemirror-schema-list");
var _prosemirrorState = require("prosemirror-state");
var _toggleCheckboxItems = require("../commands/toggleCheckboxItems");
var _checkboxes = _interopRequireDefault(require("../rules/checkboxes"));
var _CheckboxItemView = require("./CheckboxItemView");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CheckboxItem extends _Node.default {
  get name() {
    return "checkbox_item";
  }
  get schema() {
    return {
      attrs: {
        checked: {
          default: false
        }
      },
      content: "block+",
      defining: true,
      draggable: true,
      parseDOM: [{
        tag: `li[data-type="${this.name}"]`,
        getAttrs: dom => ({
          checked: dom.className.includes("checked")
        })
      }],
      // Rendering and interaction are handled by CheckboxItemView; this spec is
      // only used for serialization (e.g. clipboard, HTML export).
      toDOM: node => ["li", {
        "data-type": this.name,
        class: node.attrs.checked ? "checked" : undefined
      }, ["span", {
        contentEditable: "false"
      }, ["span", {
        class: "checkbox",
        role: "checkbox",
        "aria-checked": node.attrs.checked ? "true" : "false"
      }]], ["div", 0]]
    };
  }
  get rulePlugins() {
    return [_checkboxes.default];
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      props: {
        nodeViews: {
          [this.name]: (node, view, getPos) => new _CheckboxItemView.CheckboxItemView(node, view, getPos)
        }
      }
    })];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return {
      indentCheckboxList: () => (0, _prosemirrorSchemaList.sinkListItem)(type),
      outdentCheckboxList: () => (0, _prosemirrorSchemaList.liftListItem)(type)
    };
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      Enter: (0, _prosemirrorSchemaList.splitListItem)(type, {
        checked: false
      }),
      Tab: (0, _prosemirrorSchemaList.sinkListItem)(type),
      "Mod-Enter": (0, _toggleCheckboxItems.toggleCheckboxItems)(type),
      "Shift-Tab": (0, _prosemirrorSchemaList.liftListItem)(type),
      "Mod-]": (0, _prosemirrorSchemaList.sinkListItem)(type),
      "Mod-[": (0, _prosemirrorSchemaList.liftListItem)(type)
    };
  }
  toMarkdown(state, node) {
    state.append(node.attrs.checked ? "[x] " : "[ ] ");
    if (state.inTable) {
      node.forEach((block, _, i) => {
        if (i > 0) {
          state.append(" ");
        }
        state.renderInline(block);
      });
      return;
    }
    state.renderContent(node);
  }
  parseMarkdown() {
    return {
      block: "checkbox_item",
      getAttrs: tok => ({
        checked: tok.attrGet("checked") ? true : undefined
      })
    };
  }
}
exports.default = CheckboxItem;