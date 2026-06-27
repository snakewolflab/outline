"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _trailingNode = require("../lib/trailingNode");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Options for the TrailingNode extension.
 */

class TrailingNode extends _Extension.default {
  get name() {
    return "trailing_node";
  }
  get defaultOptions() {
    return {
      node: "paragraph",
      notAfter: _trailingNode.trailingNodeNotAfter
    };
  }
  get plugins() {
    const plugin = new _prosemirrorState.PluginKey(this.name);
    return [new _prosemirrorState.Plugin({
      key: plugin,
      view: () => ({
        update: view => {
          const {
            state
          } = view;
          const insertNodeAtEnd = plugin.getState(state);
          if (!insertNodeAtEnd || !view.editable) {
            return;
          }
          const {
            doc,
            schema,
            tr
          } = state;
          const type = schema.nodes[this.options.node];
          const transaction = tr.insert(doc.content.size, type.create());
          view.dispatch(transaction);
        }
      }),
      state: {
        init: (_, state) => (0, _trailingNode.requiresTrailingNode)(state.doc, this.options.notAfter),
        apply: (tr, value) => tr.docChanged ? (0, _trailingNode.requiresTrailingNode)(tr.doc, this.options.notAfter) : value
      }
    })];
  }
}
exports.default = TrailingNode;