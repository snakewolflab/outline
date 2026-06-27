"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.codeWordDecorations = codeWordDecorations;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _changedDescendants = require("../lib/changedDescendants");
var _multiplayer = require("../lib/multiplayer");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
class CodeWordDecorationsPlugin extends _prosemirrorState.Plugin {
  constructor() {
    let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const defaultConfig = {
      className: _EditorStyleHelper.EditorStyleHelper.codeWord,
      maxWordLength: 40
    };
    const finalConfig = {
      ...defaultConfig,
      ...config
    };
    super({
      state: {
        init: (_, state) => ({
          decorations: this.createDecorations(state, finalConfig)
        }),
        apply: (tr, pluginState, _oldState, newState) => {
          if (!tr.docChanged) {
            return pluginState;
          }
          if ((0, _multiplayer.isRemoteTransaction)(tr) || this.hasCodeInlineChange(tr)) {
            return {
              decorations: this.createDecorations(newState, finalConfig)
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
   * Check if the transaction changed any text nodes with code_inline marks.
   */
  hasCodeInlineChange(tr) {
    const codeMarkType = tr.doc.type.schema.marks.code_inline;
    if (!codeMarkType) {
      return false;
    }
    let found = false;
    const check = node => {
      if (!found && node.isText && node.marks.some(m => m.type === codeMarkType)) {
        found = true;
      }
    };
    (0, _changedDescendants.changedDescendants)(tr.before, tr.doc, 0, check);
    if (!found) {
      (0, _changedDescendants.changedDescendants)(tr.doc, tr.before, 0, check);
    }
    return found;
  }
  createDecorations(state, config) {
    const decorations = [];
    const codeMarkType = state.schema.marks.code_inline;
    if (!codeMarkType) {
      return _prosemirrorView.DecorationSet.empty;
    }
    state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        // Check if this text node has the code_inline mark
        const codeMark = node.marks.find(mark => mark.type === codeMarkType);
        if (codeMark) {
          const text = node.text;

          // Split on spaces only rather than word breaks for code
          const words = text.split(" ");
          let currentPos = pos;
          for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // Tokens longer than a line cannot move to the next line as a unit,
            // so leave them unwrapped to inherit the editor's default breaking
            // rather than overflow.
            if (word.length > 0 && word.length <= config.maxWordLength) {
              const wordStart = currentPos;
              const wordEnd = wordStart + word.length;

              // Create a decoration for each word
              decorations.push(_prosemirrorView.Decoration.inline(wordStart, wordEnd, {
                class: config.className,
                nodeName: "span"
              }));
            }

            // Move position forward by word length + 1 for the space
            currentPos += word.length + 1;
          }
        }
      }
      return true;
    });
    return _prosemirrorView.DecorationSet.create(state.doc, decorations);
  }
}

/**
 * Creates a plugin that decorates individual words inside inline code marks
 * with span elements.
 */
function codeWordDecorations() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new CodeWordDecorationsPlugin(config);
}