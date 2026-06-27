"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ctrlDisplay = exports.altDisplay = void 0;
exports.isModKey = isModKey;
exports.metaDisplay = exports.meta = void 0;
exports.normalizeKeyDisplay = normalizeKeyDisplay;
exports.shortcutSeparator = void 0;
var _browser = require("./browser");
/**
 * Returns the display string for the alt key
 */
const altDisplay = exports.altDisplay = _browser.isMac ? "⌥" : "Alt";

/**
 * Returns the display string for the meta key
 */
const metaDisplay = exports.metaDisplay = _browser.isMac ? "⌘" : "Ctrl";

/**
 * Returns the display string for the control key
 */
const ctrlDisplay = exports.ctrlDisplay = _browser.isMac ? "^" : "Ctrl";

/**
 * Separator displayed between shortcut keys — "+" on Windows, empty on Mac.
 */
const shortcutSeparator = exports.shortcutSeparator = _browser.isMac ? "" : "+";

/**
 * Returns the name of the modifier key
 */
const meta = exports.meta = _browser.isMac ? "cmd" : "ctrl";

/**
 * Returns true if the given event is a modifier key (Cmd on Mac, Ctrl on other platforms).
 * @param event The event to check
 * @returns True if the event is a modifier key
 */
function isModKey(event) {
  return _browser.isMac ? event.metaKey : event.ctrlKey;
}

/**
 * Returns a string with the appropriate display strings for the given key
 *
 * @param key The key to display
 * @param toUpperCase Whether to render single letters as uppercase
 * @returns The display string for the key
 */
function normalizeKeyDisplay(key, toUpperCase) {
  if (key.length === 1 && toUpperCase) {
    return key.toUpperCase();
  }
  return key.replace(/^Key([A-Z])$/i, (_, letter) => toUpperCase ? letter.toUpperCase() : letter).replace(/Meta/i, metaDisplay).replace(/Cmd/i, metaDisplay).replace(/Alt/i, altDisplay).replace(/Control/i, ctrlDisplay).replace(/Shift/i, "⇧");
}