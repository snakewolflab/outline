"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmojiText = EmojiText;
var _validator = require("validator");
var _emoji = require("../editor/lib/emoji");
var _CustomEmoji = require("./CustomEmoji");
var _jsxRuntime = require("react/jsx-runtime");
// Matches emoji shortcodes like :smile: or :550e8400-e29b-41d4-a716-446655440000:
const emojiShortcodeRegex = /:([a-zA-Z0-9_-]+):/g;

/**
 * Renders text with embedded emoji shortcodes. Standard emoji shortcodes like
 * :smile: are converted to native emoji characters, while UUID shortcodes are
 * rendered as custom emoji images.
 *
 * @param props.children - the text to render, which may contain emoji shortcodes.
 * @param props.emojiSize - size of rendered custom emojis.
 * @returns a React element with text and inline emojis.
 */
function EmojiText(_ref) {
  let {
    children,
    emojiSize = "1em"
  } = _ref;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = emojiShortcodeRegex.exec(children)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(children.slice(lastIndex, match.index));
    }
    const shortcode = match[1];
    if ((0, _validator.isUUID)(shortcode)) {
      // Custom emoji - render as image
      parts.push(/*#__PURE__*/(0, _jsxRuntime.jsx)(_CustomEmoji.CustomEmoji, {
        value: shortcode,
        size: emojiSize
      }, key++));
    } else {
      // Standard emoji - convert to native character
      const emoji = (0, _emoji.getEmojiFromName)(shortcode);
      if (emoji !== "?") {
        parts.push(emoji);
      } else {
        // Unknown shortcode, keep original text
        parts.push(match[0]);
      }
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  // Reset regex state for next call
  emojiShortcodeRegex.lastIndex = 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: parts
  });
}