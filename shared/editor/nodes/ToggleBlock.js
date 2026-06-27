"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleStorageKey = exports.toggleFoldPluginKey = exports.toggleEventPluginKey = exports.default = exports.Action = void 0;
var _i18next = require("i18next");
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTransform = require("prosemirror-transform");
var _prosemirrorView = require("prosemirror-view");
var _uuid = require("uuid");
var _Storage = _interopRequireDefault(require("../../utils/Storage"));
var _toggleBlock = require("../commands/toggleBlock");
var _PlaceholderPlugin = require("../plugins/PlaceholderPlugin");
var _findChildren = require("../queries/findChildren");
var _findCutAfterHeading = require("../queries/findCutAfterHeading");
var _isNodeActive = require("../queries/isNodeActive");
var _toggleBlocks = _interopRequireDefault(require("../rules/toggleBlocks"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _utils = require("../utils");
var _toggleBlock2 = require("../queries/toggleBlock");
var _Node = _interopRequireDefault(require("./Node"));
var _ToggleBlockView = require("./ToggleBlockView");
var _multiplayer = require("../lib/multiplayer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let Action = exports.Action = /*#__PURE__*/function (Action) {
  Action[Action["INIT"] = 0] = "INIT";
  Action[Action["FOLD"] = 1] = "FOLD";
  Action[Action["UNFOLD"] = 2] = "UNFOLD";
  return Action;
}({});
/** Plugin key for toggle block fold state management. */
const toggleFoldPluginKey = exports.toggleFoldPluginKey = new _prosemirrorState.PluginKey("toggleFold");

/** Plugin key for toggle block fold/unfold events. */
const toggleEventPluginKey = exports.toggleEventPluginKey = new _prosemirrorState.PluginKey("toggleBlockEvent");

/** Build the localStorage key used to persist a toggle block's fold state. */
const toggleStorageKey = id => `toggle:${id}`;
exports.toggleStorageKey = toggleStorageKey;
class ToggleBlock extends _Node.default {
  get name() {
    return "container_toggle";
  }
  get schema() {
    return {
      content: "(paragraph | heading) block*",
      group: "block",
      attrs: {
        id: {
          default: undefined
        }
      },
      parseDOM: [{
        tag: "div[data-type='container_toggle']",
        preserveWhitespace: "full"
      }, {
        tag: `div.${_EditorStyleHelper.EditorStyleHelper.toggleBlock}`,
        preserveWhitespace: "full"
      }],
      toDOM: () => ["div", {
        class: _EditorStyleHelper.EditorStyleHelper.toggleBlock
      }, ["div", {
        class: _EditorStyleHelper.EditorStyleHelper.toggleBlockContent
      }, 0]]
    };
  }
  get plugins() {
    // Assign IDs and auto-fold empty
    const plugin = new _prosemirrorState.Plugin({
      appendTransaction: (transactions, _oldState, newState) => {
        if (!transactions.some(tr => tr.docChanged)) {
          return null;
        }

        // Single pass to find all toggle blocks
        const toggleBlocks = (0, _findChildren.findBlockNodes)(newState.doc, true).filter(b => b.node.type.name === this.name);
        if (toggleBlocks.length === 0) {
          return null;
        }
        let tr = null;

        // Assign IDs to blocks that need them and default to unfolded in this browser
        const blocksNeedingIds = toggleBlocks.filter(b => !b.node.attrs.id);
        if (blocksNeedingIds.length > 0) {
          tr = newState.tr;
          blocksNeedingIds.forEach(block => {
            const id = (0, _uuid.v4)();
            tr.setNodeAttribute(block.pos, "id", id);
            _Storage.default.set(toggleStorageKey(id), {
              fold: false
            });
          });
        }

        // Auto-fold toggle blocks with empty bodies, only if no structural
        // changes were made (positions would be invalid)
        if (!tr) {
          const pluginState = toggleFoldPluginKey.getState(newState);
          if (pluginState) {
            const emptyBodyBlock = toggleBlocks.find(b => b.node.childCount === 1 && b.node.attrs.id && !pluginState.foldedIds.has(b.node.attrs.id));
            if (emptyBodyBlock) {
              return newState.tr.setMeta(toggleFoldPluginKey, {
                type: Action.FOLD,
                at: emptyBodyBlock.pos
              });
            }
          }
        }
        return tr;
      }
    });

    // Main fold state management
    const foldPlugin = new _prosemirrorState.Plugin({
      key: toggleFoldPluginKey,
      state: {
        init: (_config, state) => {
          const foldedIds = this.initFoldedIds(state);
          return {
            foldedIds,
            decorations: this.createDecorations(state.doc, foldedIds)
          };
        },
        apply: (tr, pluginState, _oldState, newState) => {
          if ((0, _multiplayer.isRemoteTransaction)(tr)) {
            const foldedIds = this.initFoldedIds(newState);
            return {
              foldedIds,
              decorations: this.createDecorations(newState.doc, foldedIds)
            };
          }
          const action = tr.getMeta(toggleFoldPluginKey);

          // No action - just map decorations through the transaction
          if (!action) {
            if (!tr.docChanged) {
              return pluginState;
            }

            // Check if any toggle blocks were added and need fold state
            const currentBlocks = (0, _findChildren.findBlockNodes)(tr.doc, true).filter(b => b.node.type.name === this.name && b.node.attrs.id);
            const newFoldedIds = new Set(pluginState.foldedIds);

            // For any new blocks, check storage and default to folded
            currentBlocks.forEach(block => {
              const id = block.node.attrs.id;
              if (!pluginState.foldedIds.has(id)) {
                const stored = _Storage.default.get(toggleStorageKey(id));
                // Default to folded if no stored state (new block from sync)
                if (stored?.fold !== false) {
                  newFoldedIds.add(id);
                }
              }
            });

            // Always rebuild decorations to ensure head positions are correct
            // (mapping can produce incorrect positions when first child changes)
            return {
              foldedIds: newFoldedIds,
              decorations: this.createDecorations(tr.doc, newFoldedIds)
            };
          }

          // Handle actions that change fold state
          const newFoldedIds = new Set(pluginState.foldedIds);
          switch (action.type) {
            case Action.FOLD:
              {
                const node = newState.doc.nodeAt(action.at);
                if (node?.attrs.id) {
                  newFoldedIds.add(node.attrs.id);
                  _Storage.default.set(toggleStorageKey(node.attrs.id), {
                    fold: true
                  });
                }
                break;
              }
            case Action.UNFOLD:
              {
                const node = newState.doc.nodeAt(action.at);
                if (node?.attrs.id) {
                  newFoldedIds.delete(node.attrs.id);
                  _Storage.default.set(toggleStorageKey(node.attrs.id), {
                    fold: false
                  });
                }
                break;
              }
          }
          return {
            foldedIds: newFoldedIds,
            decorations: this.createDecorations(newState.doc, newFoldedIds)
          };
        }
      },
      props: {
        decorations: state => toggleFoldPluginKey.getState(state)?.decorations,
        nodeViews: {
          [this.name]: (node, view, getPos, decorations, innerDecorations) => new _ToggleBlockView.ToggleBlockView(node, view, getPos, decorations, innerDecorations)
        }
      }
    });

    // Handle fold/unfold side effects (cursor management, empty body handling)
    const eventPlugin = new _prosemirrorState.Plugin({
      key: toggleEventPluginKey,
      appendTransaction: (transactions, _oldState, newState) => {
        const eventTr = transactions.find(tr => tr.getMeta(toggleEventPluginKey));
        let tr = null;
        if (eventTr) {
          const event = eventTr.getMeta(toggleEventPluginKey);
          const node = newState.doc.nodeAt(event.at);
          if (node) {
            if (event.type === Action.FOLD) {
              // Move cursor out of body if folding
              const {
                $anchor
              } = newState.selection;
              const startOfNode = event.at + 1;
              const endOfFirstChild = startOfNode + node.firstChild.nodeSize;
              const endOfNode = startOfNode + node.nodeSize - 1;
              if ($anchor.pos > endOfFirstChild && $anchor.pos < endOfNode) {
                const $endOfFirstChild = newState.doc.resolve(endOfFirstChild);
                tr = newState.tr.setSelection(_prosemirrorState.TextSelection.near($endOfFirstChild, -1));
              }
            } else if (event.type === Action.UNFOLD) {
              // Insert empty paragraph if body is empty (for placeholder visibility)
              if (node.childCount === 1) {
                tr = newState.tr.insert(event.at + 1 + node.content.size, newState.schema.nodes.paragraph.create({}));
              }
            }
          }
        }

        // Auto-unfold if cursor is in body of folded toggle
        // Skip if we're handling a fold event (cursor will be moved out of body)
        const isFoldEvent = eventTr?.getMeta(toggleEventPluginKey)?.type === Action.FOLD;
        if (!isFoldEvent) {
          const {
            $from
          } = newState.selection;
          const pluginState = toggleFoldPluginKey.getState(newState);
          const isToggle = (0, _toggleBlock2.isToggleBlock)(newState);
          if (pluginState) {
            const toggleBlockAncestor = (0, _utils.ancestors)($from).find(node => isToggle(node) && pluginState.foldedIds.has(node.attrs.id));
            if (toggleBlockAncestor) {
              const d = (0, _toggleBlock2.getToggleBlockDepth)($from, toggleBlockAncestor);
              const posAfterHead = $from.start(d) + toggleBlockAncestor.firstChild.nodeSize;
              const posAtEnd = $from.end(d);
              if ($from.pos > posAfterHead && $from.pos < posAtEnd) {
                tr = (tr ?? newState.tr).setMeta(toggleFoldPluginKey, {
                  type: Action.UNFOLD,
                  at: $from.before(d)
                });
              }
            }
          }
        }
        return tr;
      }
    });
    return [plugin, foldPlugin, eventPlugin, new _PlaceholderPlugin.PlaceholderPlugin([{
      condition: _ref => {
        let {
          node,
          $start,
          parent
        } = _ref;
        return parent !== null && parent.type.name === "container_toggle" && $start.index($start.depth - 1) === 0 && node.textContent === "";
      },
      text: `${(0, _i18next.t)("Add title")}…`
    }, {
      condition: _ref2 => {
        let {
          parent,
          $start,
          state
        } = _ref2;
        return parent !== null && parent.type.name === "container_toggle" && $start.index($start.depth - 1) === 1 && ToggleBlock.isBodyEmpty(parent) && (state.selection.$from.pos < $start.pos || state.selection.$from.pos > $start.end($start.depth - 1));
      },
      text: `${(0, _i18next.t)("Add content")}…`
    }, {
      condition: _ref3 => {
        let {
          node,
          parent,
          $start,
          state
        } = _ref3;
        return parent !== null && parent.type.name === "container_toggle" && node.isTextblock && node.textContent === "" && state.selection.$cursor?.pos === $start.pos;
      },
      text: `${(0, _i18next.t)("Type '/' to insert")}…`
    }], ["paragraph", "heading"])];
  }
  get rulePlugins() {
    return [_toggleBlocks.default];
  }
  keys() {
    return {
      Backspace: (0, _prosemirrorCommands.chainCommands)(_toggleBlock.deleteSelectionPreservingBody, _toggleBlock.liftAllChildBlocksOfNodeBefore, _toggleBlock.joinBackwardWithToggleblock, _toggleBlock.selectNodeBackwardPreservingBody),
      Enter: (0, _prosemirrorCommands.chainCommands)(_prosemirrorCommands.newlineInCode, _toggleBlock.createParagraphNearPreservingBody, _toggleBlock.liftAllEmptyChildBlocks, _toggleBlock.exitToggleBlockOnEmptyParagraph, _toggleBlock.splitBlockPreservingBody, _toggleBlock.splitTopLevelBlockWithinBody),
      Delete: (0, _prosemirrorCommands.chainCommands)(_toggleBlock.deleteSelectionPreservingBody, _toggleBlock.liftAllChildBlocksOfNodeAfter, _toggleBlock.joinForwardPreservingBody, _toggleBlock.selectNodeForwardPreservingBody),
      Tab: _toggleBlock.indentBlock,
      "Shift-Tab": _toggleBlock.dedentBlocks,
      "Mod-Enter": _toggleBlock.toggleBlock
    };
  }
  inputRules(_ref4) {
    let {
      type
    } = _ref4;
    return [(0, _prosemirrorInputrules.wrappingInputRule)(/^\s*\+\+\+\s$/, type, undefined, (_match, _node) => false)];
  }
  commands(_ref5) {
    let {
      type,
      schema
    } = _ref5;
    return attrs => (state, dispatch) => {
      const {
        $from,
        $to
      } = state.selection;
      const level = attrs && typeof attrs === "object" && "level" in attrs && typeof attrs.level === "number" ? attrs.level : undefined;
      if ((0, _isNodeActive.isNodeActive)(type)(state)) {
        dispatch?.((0, _utils.liftChildrenOfNodeAt)($from.before(-1), state.tr));
        return true;
      }
      // if heading
      if ($from.parent.type === state.schema.nodes.heading) {
        const $fr_ = _prosemirrorState.TextSelection.near($from, 1).$from;
        const $to_ = _prosemirrorState.TextSelection.near((0, _findCutAfterHeading.findCutAfterHeading)($from), -1).$to;
        const id = (0, _uuid.v4)();
        const range = $fr_.blockRange($to_),
          wrapping = range && (0, _prosemirrorTransform.findWrapping)(range, type, {
            id
          });
        if (!wrapping) {
          return false;
        }
        _Storage.default.set(toggleStorageKey(id), {
          fold: false
        });
        const tr = state.tr.wrap(range, wrapping);
        dispatch?.(tr);
        return true;
      }
      // if para
      if ($from.parent.type === state.schema.nodes.paragraph) {
        const id = (0, _uuid.v4)();
        const range = $from.blockRange($to),
          wrapping = range && (0, _prosemirrorTransform.findWrapping)(range, type, {
            id
          });
        if (!wrapping) {
          return false;
        }
        _Storage.default.set(toggleStorageKey(id), {
          fold: false
        });
        const tr = state.tr.wrap(range, wrapping);

        // When a heading level is provided, make the toggle's title a heading
        // rather than a paragraph (a collapsible heading).
        if (level) {
          tr.setNodeMarkup(tr.selection.$from.before(), schema.nodes.heading, {
            level
          });
        }
        dispatch?.(tr.insert(tr.selection.$from.after(), schema.nodes.paragraph.create({})));
        return true;
      }
      return false;
    };
  }
  toMarkdown(state, node) {
    state.write(state.repeat("+", 3 + (0, _utils.height)(node)) + "\n");
    state.renderContent(node);
    state.write(state.repeat("+", 3 + (0, _utils.height)(node)) + "\n");
  }
  parseMarkdown() {
    return {
      block: "container_toggle"
    };
  }
  initFoldedIds(state) {
    const pluginState = toggleFoldPluginKey.getState(state);
    const foldedIds = new Set(pluginState?.foldedIds);
    (0, _findChildren.findBlockNodes)(state.doc, true).filter(b => b.node.type.name === this.name && b.node.attrs.id).forEach(block => {
      const id = block.node.attrs.id;
      const stored = _Storage.default.get(toggleStorageKey(id));
      // Default to folded if no stored state
      if (stored?.fold !== false) {
        foldedIds.add(id);
      }
      // Ensure storage has a value
      if (stored === null || stored === undefined) {
        _Storage.default.set(toggleStorageKey(id), {
          fold: true
        });
      }
    });
    return foldedIds;
  }
  createDecorations(doc, foldedIds) {
    const decorations = [];
    (0, _findChildren.findBlockNodes)(doc, true).filter(b => b.node.type.name === "container_toggle" && b.node.attrs.id).forEach(block => {
      const id = block.node.attrs.id;
      const isFolded = foldedIds.has(id);

      // Decoration on the toggle block itself (for fold state)
      decorations.push(_prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {}, {
        nodeId: id,
        fold: isFolded,
        target: "container_toggle"
      }));

      // Decoration on the head (first child) for styling
      decorations.push(_prosemirrorView.Decoration.node(block.pos + 1, block.pos + 1 + block.node.firstChild.nodeSize, {
        nodeName: "div",
        class: _EditorStyleHelper.EditorStyleHelper.toggleBlockHead
      }, {
        nodeId: id,
        target: "container_toggle>:firstChild"
      }));

      // If doc is read-only, add a decoration to show pointer cursor on the head
      // to indicate it's clickable for toggling
      if (this.editor.props.readOnly) {
        decorations.push(_prosemirrorView.Decoration.inline(block.pos + 1, block.pos + 1 + block.node.firstChild.nodeSize, {
          style: "cursor: pointer"
        }, {
          nodeId: id,
          target: "container_toggle>:firstChild"
        }));
      }
    });
    return _prosemirrorView.DecorationSet.create(doc, decorations);
  }
  static isEmpty(toggleBlock) {
    return ToggleBlock.isHeadEmpty(toggleBlock) && ToggleBlock.isBodyEmpty(toggleBlock);
  }
  static isHeadEmpty(toggleBlock) {
    return toggleBlock.firstChild.content.size === 0;
  }
  static isBodyEmpty(toggleBlock) {
    for (let i = 1; i < toggleBlock.childCount; i++) {
      if (toggleBlock.child(i).content.size > 0) {
        return false;
      }
    }
    return true;
  }
}
exports.default = ToggleBlock;