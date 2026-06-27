"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _listInputRule = require("../lib/listInputRule");
var _alphaLists = _interopRequireDefault(require("../rules/alphaLists"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class OrderedList extends _Node.default {
  get name() {
    return "ordered_list";
  }
  get rulePlugins() {
    return [_alphaLists.default];
  }
  get schema() {
    return {
      attrs: {
        order: {
          default: 1,
          validate: "number"
        },
        listStyle: {
          default: "number",
          validate: style => ["number", "lower-alpha", "upper-alpha"].includes(style)
        }
      },
      content: "list_item+",
      group: "block list",
      parseDOM: [{
        tag: "ol",
        getAttrs: dom => ({
          order: dom.hasAttribute("start") ? parseInt(dom.getAttribute("start") || "1", 10) : 1,
          listStyle: dom.style.listStyleType
        })
      }],
      toDOM: node => {
        const attrs = {};
        if (node.attrs.order !== 1) {
          attrs.start = node.attrs.order;
        }
        if (node.attrs.listStyle !== "number") {
          attrs.style = `list-style-type: ${node.attrs.listStyle}`;
        }
        return ["ol", attrs, 0];
      }
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return {
      ordered_list: () => (0, _toggleList.default)(type, schema.nodes.list_item),
      toggleLowerLetterList: () => (0, _toggleList.default)(type, schema.nodes.list_item, "lower-alpha"),
      toggleUpperLetterList: () => (0, _toggleList.default)(type, schema.nodes.list_item, "upper-alpha")
    };
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    return {
      "Shift-Ctrl-9": (0, _toggleList.default)(type, schema.nodes.list_item),
      "Shift-Ctrl-5": this.commands({
        type,
        schema
      }).toggleUpperLetterList(),
      "Shift-Ctrl-6": this.commands({
        type,
        schema
      }).toggleLowerLetterList()
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _listInputRule.listWrappingInputRule)(/^(\d+)\.\s$/, type, match => ({
      order: +match[1],
      listStyle: "number"
    }), (match, node) => node.childCount + node.attrs.order === +match[1]), (0, _listInputRule.listWrappingInputRule)(/^([a-z])\.\s$/, type, match => ({
      order: match[1].charCodeAt(0) - 96,
      listStyle: "lower-alpha"
    }), (match, node) => {
      const expectedChar = String.fromCharCode(96 + node.childCount + node.attrs.order);
      return expectedChar === match[1];
    }), (0, _listInputRule.listWrappingInputRule)(/^([A-Z])\.\s$/, type, match => ({
      order: match[1].charCodeAt(0) - 64,
      listStyle: "upper-alpha"
    }), (match, node) => {
      const expectedChar = String.fromCharCode(64 + node.childCount + node.attrs.order);
      return expectedChar === match[1];
    })];
  }
  toMarkdown(state, node) {
    state.write("\n");
    const start = node.attrs.order !== undefined ? node.attrs.order : 1;
    const upperOrLowerAlpha = node.attrs.listStyle === "lower-alpha" || node.attrs.listStyle === "upper-alpha";
    if (upperOrLowerAlpha) {
      const space = state.repeat(" ", 4);
      state.renderList(node, space, index => {
        const alphabetSize = 26;
        const position = start + index;
        const asciiStart = node.attrs.listStyle === "lower-alpha" ? 97 : 65;
        let n = position - 1;
        let result = "";
        do {
          const charCode = asciiStart + n % alphabetSize;
          result = String.fromCharCode(charCode) + result;
          n = Math.floor(n / alphabetSize) - 1;
        } while (n >= 0);
        return result + ". ";
      });
    } else {
      const maxW = `${start + node.childCount - 1}`.length;
      const space = state.repeat(" ", maxW + 2);
      state.renderList(node, space, index => {
        const nStr = `${start + index}`;
        return state.repeat(" ", maxW - nStr.length) + nStr + ". ";
      });
    }
  }
  parseMarkdown() {
    return {
      block: "ordered_list",
      getAttrs: tok => {
        const start = tok.attrGet("start") || "1";

        // Check for data-list-style attribute set by alphaLists plugin
        const dataListStyle = tok.attrGet("data-list-style");
        let listStyle = dataListStyle || "number";

        // Fallback to checking markup if data-list-style is not present
        if (!dataListStyle) {
          if (tok.markup && /^[a-z]/.test(tok.markup)) {
            listStyle = "lower-alpha";
          } else if (tok.markup && /^[A-Z]/.test(tok.markup)) {
            listStyle = "upper-alpha";
          }
        }
        return {
          order: parseInt(start, 10),
          listStyle
        };
      }
    };
  }
}
exports.default = OrderedList;