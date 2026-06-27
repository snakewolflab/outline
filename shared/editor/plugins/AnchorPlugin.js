"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.anchorPlugin = exports.AnchorPlugin = void 0;
var _ProsemirrorHelper = require("../../utils/ProsemirrorHelper");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _changedDescendants = require("../lib/changedDescendants");
var _multiplayer = require("../lib/multiplayer");
class AnchorPlugin extends _prosemirrorState.Plugin {
  constructor() {
    super({
      state: {
        init: (_, state) => ({
          decorations: this.createDecorations(state)
        }),
        apply: (tr, pluginState, _oldState, newState) => {
          if (!tr.docChanged) {
            return pluginState;
          }
          if ((0, _multiplayer.isRemoteTransaction)(tr) || this.hasAnchorableChange(tr)) {
            return {
              decorations: this.createDecorations(newState)
            };
          }
          return {
            decorations: pluginState.decorations.map(tr.mapping, tr.doc)
          };
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
  isAnchorable(node) {
    return node.type.name === "heading" || Array.isArray(node.attrs.marks) && node.attrs.marks.some(mark => mark.type === "comment" && mark.attrs?.id);
  }

  /**
   * Check if the transaction changed any heading or image-with-comment-mark
   * nodes by comparing changed descendants in both directions.
   */
  hasAnchorableChange(tr) {
    let found = false;
    const check = node => {
      if (!found && this.isAnchorable(node)) {
        found = true;
      }
    };
    (0, _changedDescendants.changedDescendants)(tr.before, tr.doc, 0, check);
    if (!found) {
      (0, _changedDescendants.changedDescendants)(tr.doc, tr.before, 0, check);
    }
    return found;
  }
  createAnchorDecoration(anchor) {
    return _prosemirrorView.Decoration.widget(anchor.pos, () => {
      const anchorElement = document.createElement("a");
      anchorElement.id = anchor.id;
      anchorElement.className = anchor.className;
      return anchorElement;
    }, {
      side: -1,
      key: anchor.id
    });
  }
  createDecorations(state) {
    const anchors = _ProsemirrorHelper.ProsemirrorHelper.getAnchors(state.doc);
    return _prosemirrorView.DecorationSet.create(state.doc, anchors.map(this.createAnchorDecoration));
  }
}
exports.AnchorPlugin = AnchorPlugin;
const anchorPlugin = () => new AnchorPlugin();
exports.anchorPlugin = anchorPlugin;