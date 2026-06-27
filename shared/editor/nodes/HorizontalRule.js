"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18next = require("i18next");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _outlineIcons = require("outline-icons");
var _isNodeActive = require("../queries/isNodeActive");
var _Node = _interopRequireDefault(require("./Node"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class HorizontalRule extends _Node.default {
  get name() {
    return "hr";
  }
  get schema() {
    return {
      attrs: {
        markup: {
          default: "---"
        }
      },
      group: "block",
      parseDOM: [{
        tag: "hr"
      }],
      toDOM: node => ["hr", {
        class: node.attrs.markup === "***" ? "page-break" : ""
      }]
    };
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return attrs => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
      return true;
    };
  }
  selectionToolbarMenus() {
    return [{
      priority: 50,
      matches: ctx => ctx.selectedNodeType === "hr" && !ctx.readOnly,
      getItems: ctx => {
        const {
          schema
        } = ctx;
        return [{
          name: "hr",
          tooltip: (0, _i18next.t)("Divider"),
          attrs: {
            markup: "---"
          },
          active: (0, _isNodeActive.isNodeActive)(schema.nodes.hr, {
            markup: "---"
          }),
          icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.HorizontalRuleIcon, {})
        }, {
          name: "hr",
          tooltip: (0, _i18next.t)("Page break"),
          attrs: {
            markup: "***"
          },
          active: (0, _isNodeActive.isNodeActive)(schema.nodes.hr, {
            markup: "***"
          }),
          icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.PageBreakIcon, {})
        }];
      }
    }];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-_": (state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
        return true;
      }
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [new _prosemirrorInputrules.InputRule(/^(?:---|___|\*\*\*)$/, (state, match, start, end) => {
      const {
        tr
      } = state;
      if (match[0]) {
        const markup = match[0].trim();
        tr.replaceWith(start - 1, end, type.create({
          markup
        }));
      }
      return tr;
    })];
  }
  toMarkdown(state, node) {
    state.write(`\n${node.attrs.markup}`);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      node: "hr",
      getAttrs: tok => ({
        markup: tok.markup
      })
    };
  }
}
exports.default = HorizontalRule;