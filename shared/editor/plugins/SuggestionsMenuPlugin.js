"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SuggestionsMenuPlugin = void 0;
exports.isTriggerMarked = isTriggerMarked;
var _mobx = require("mobx");
var _prosemirrorState = require("prosemirror-state");
var _getMarksBetween = require("../queries/getMarksBetween");
const MAX_MATCH = 500;
/**
 * Determine whether the trigger character of a suggestion match carries any
 * marks (e.g. bold, code, link).
 *
 * @param state The editor state.
 * @param cursorPos The document position of the cursor (end of the match).
 * @param match The regex match where group 1 is the search term.
 * @returns True if the trigger character has one or more marks applied.
 */
function isTriggerMarked(state, cursorPos, match) {
  const queryLength = match[1]?.length ?? 0;
  const triggerEnd = cursorPos - queryLength;
  const triggerStart = triggerEnd - 1;
  if (triggerStart < 0) {
    return false;
  }
  return (0, _getMarksBetween.getMarksBetween)(triggerStart, triggerEnd, state).length > 0;
}
class SuggestionsMenuPlugin extends _prosemirrorState.Plugin {
  constructor(extensionState, openRegex, enabledInMarks) {
    super({
      props: {
        handleDOMEvents: {
          // IME composition (e.g. Korean, Japanese, Chinese) fires compositionupdate
          // as each character is being built up. ProseMirror's view.composing flag
          // blocks the normal handleKeyDown path, so we handle it separately here.
          compositionupdate: view => {
            setTimeout(() => {
              const {
                pos: fromPos
              } = view.state.selection.$from;
              const state = view.state;
              const $from = state.doc.resolve(fromPos);
              if ($from.parent.type.spec.code) {
                return;
              }
              const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined, "\ufffc");
              const match = openRegex.exec(textBefore);
              (0, _mobx.action)(() => {
                if (match && (enabledInMarks || !isTriggerMarked(state, fromPos, match))) {
                  if (match[0].length <= 2) {
                    extensionState.open = true;
                  }
                  extensionState.query = match[1];
                }
              })();
            }, 0);
            return false;
          }
        },
        handleKeyDown: (view, event) => {
          // Prosemirror input rules are not triggered on backspace, however
          // we need them to be evaluated for the filter trigger to work
          // correctly. This additional handler adds inputrules-like handling.
          if (event.key === "Backspace") {
            // timeout ensures that the delete has been handled by prosemirror
            // and any characters removed, before we evaluate the rule.
            setTimeout(() => {
              const {
                pos: fromPos
              } = view.state.selection.$from;
              this.execute(view, fromPos, fromPos, openRegex, (0, _mobx.action)((state, match) => {
                if (match && (enabledInMarks || !isTriggerMarked(state, fromPos, match))) {
                  extensionState.query = match[1];
                } else {
                  extensionState.open = false;
                }
                return null;
              }));
            }, 0);
          }

          // Another plugin (e.g. the Placeholder mark) may consume the
          // handleTextInput event by returning true, which prevents the
          // InputRule from evaluating the trigger character. We use a timeout
          // here so the re-evaluation happens after all synchronous handlers
          // have run, ensuring the suggestion menu still opens in those cases.
          if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
            setTimeout(() => {
              const {
                pos: fromPos
              } = view.state.selection.$from;
              this.execute(view, fromPos, fromPos, openRegex, (0, _mobx.action)((state, match) => {
                if (match && (enabledInMarks || !isTriggerMarked(state, fromPos, match))) {
                  if (match[0].length <= 2) {
                    extensionState.open = true;
                  }
                  extensionState.query = match[1];
                }
                return null;
              }));
            }, 0);
          }

          // If the menu is open then just ignore the key events in the editor
          // itself until we're done.
          if (event.key === "Enter" || event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Tab") {
            return extensionState.open;
          }
          return false;
        }
      }
    });
  }

  // based on the input rules code in Prosemirror, here:
  // https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
  execute(view, from, to, regex, handler) {
    if (view.composing) {
      return false;
    }
    const state = view.state;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) {
      return false;
    }
    const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined, "\ufffc");
    const match = regex.exec(textBefore);
    const result = handler(state, match, match ? from - match[0].length : from, to);
    if (!result) {
      return false;
    }
    return true;
  }
}
exports.SuggestionsMenuPlugin = SuggestionsMenuPlugin;