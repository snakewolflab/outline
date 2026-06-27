"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentedImagePlugin = exports.CommentedImagePlugin = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _changedDescendants = require("../lib/changedDescendants");
var _multiplayer = require("../lib/multiplayer");
/**
 * Plugin that applies a light outline decoration to image nodes that have
 * comment marks, providing a visual indicator that the image has been commented
 * on.
 */
class CommentedImagePlugin extends _prosemirrorState.Plugin {
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
          if ((0, _multiplayer.isRemoteTransaction)(tr) || this.hasImageChange(tr)) {
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

  /**
   * Check if the transaction added, removed, or modified any image nodes.
   */
  hasImageChange(tr) {
    let found = false;
    const check = node => {
      if (!found && node.type.name === "image") {
        found = true;
      }
    };
    (0, _changedDescendants.changedDescendants)(tr.before, tr.doc, 0, check);
    if (!found) {
      (0, _changedDescendants.changedDescendants)(tr.doc, tr.before, 0, check);
    }
    return found;
  }
  createDecorations(state) {
    const decorations = [];
    state.doc.descendants((node, pos) => {
      if (node.type.name === "image" && Array.isArray(node.attrs.marks) && node.attrs.marks.some(mark => mark.type === "comment" && !mark.attrs?.resolved)) {
        decorations.push(_prosemirrorView.Decoration.node(pos, pos + node.nodeSize, {
          class: "image-commented"
        }));
      }
    });
    return _prosemirrorView.DecorationSet.create(state.doc, decorations);
  }
}
exports.CommentedImagePlugin = CommentedImagePlugin;
const commentedImagePlugin = () => new CommentedImagePlugin();
exports.commentedImagePlugin = commentedImagePlugin;