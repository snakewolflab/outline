"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emoji;
var _markdownItEmoji = require("markdown-it-emoji");
var _validator = require("validator");
var _emoji = require("../lib/emoji");
/**
 * Custom markdown-it inline rule to parse UUID-based custom emojis in the format :uuid:
 * This catches custom emoji UUID patterns that the standard emoji plugin doesn't recognize.
 *
 * @param state - The markdown-it state object for inline parsing.
 * @param silent - When true, only checks if the rule matches without creating tokens.
 * @returns True if the rule matched and processed content, false otherwise.
 */
function customEmojiRule(state, silent) {
  const start = state.pos;
  const max = state.posMax;

  // Must start with a colon
  if (state.src.charCodeAt(start) !== 0x3a /* : */) {
    return false;
  }

  // Find the closing colon
  let pos = start + 1;
  while (pos < max && state.src.charCodeAt(pos) !== 0x3a /* : */) {
    pos++;
  }

  // No closing colon found
  if (pos >= max) {
    return false;
  }

  // Extract the content between colons
  const content = state.src.slice(start + 1, pos);

  // Check if it's a valid UUID (any version)
  if (!(0, _validator.isUUID)(content)) {
    return false;
  }

  // If we're in silent mode (checking if rule matches), just return true
  if (!silent) {
    const token = state.push("emoji", "", 0);
    token.markup = content;
    token.content = content;
  }
  state.pos = pos + 1;
  return true;
}
function emoji(md) {
  // Ideally this would be an empty object, but due to a bug in markdown-it-emoji
  // passing an empty object results in newlines becoming emojis. Until this is
  // fixed at least one key is required. See:
  // https://github.com/markdown-it/markdown-it-emoji/issues/46
  const noMapping = {
    no_name_mapping: "💯"
  };

  // Add the custom emoji rule first so it can catch UUID patterns
  md.inline.ruler.push("custom_emoji", customEmojiRule);

  // Apply the standard emoji plugin to handle regular emoji names
  (0, _markdownItEmoji.full)(md, {
    defs: md.options.emoji === false ? noMapping : _emoji.nameToEmoji,
    shortcuts: {}
  });
  return md;
}