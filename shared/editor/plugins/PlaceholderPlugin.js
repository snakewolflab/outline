"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaceholderPlugin = void 0;
var _compat = require("es-toolkit/compat");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
class PlaceholderPlugin extends _prosemirrorState.Plugin {
  /**
   * @param config Placeholder conditions to evaluate against candidate nodes.
   * @param nodeTypes Names of the node types eligible for a placeholder.
   * Defaults to paragraphs only.
   */
  constructor(config) {
    let nodeTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["paragraph"];
    super({
      state: {
        init: (_, state) => ({
          decorations: this.createDecorations(state, config, nodeTypes)
        }),
        apply: (tr, pluginState, oldState, newState) => {
          // Only recompute if doc or selection changed
          if (tr.docChanged || tr.selectionSet) {
            return {
              decorations: this.createDecorations(newState, config, nodeTypes)
            };
          }
          return pluginState;
        }
      },
      props: {
        decorations: state => {
          const pluginState = this.getState(state);
          return pluginState ? pluginState.decorations : null;
        }
      }
    });
  }
  createDecorations(state, config, nodeTypes) {
    const paras = [];
    state.doc.descendants((node, pos, parent) => {
      if (nodeTypes.includes(node.type.name)) {
        paras.push({
          node,
          $start: state.doc.resolve(pos + 1),
          parent
        });
        return false;
      }
      return true;
    });
    const textContent = state.doc.textContent;
    const decorations = (0, _compat.filter)((0, _compat.map)(paras, para => {
      const condMet = (0, _compat.find)(config, conf => conf.condition({
        node: para.node,
        $start: para.$start,
        parent: para.parent,
        state,
        textContent
      }));
      return condMet ? _prosemirrorView.Decoration.node(para.$start.pos - 1, para.$start.pos - 1 + para.node.nodeSize, {
        class: "placeholder",
        "data-empty-text": condMet.text
      }) : undefined;
    }), decoration => decoration !== undefined);
    return _prosemirrorView.DecorationSet.create(state.doc, decorations);
  }
}
exports.PlaceholderPlugin = PlaceholderPlugin;