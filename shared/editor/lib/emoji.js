"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNameFromEmoji = exports.getEmojiFromName = exports.emojiMartToGemoji = void 0;
exports.loadEmojiData = loadEmojiData;
exports.nameToEmoji = void 0;
exports.parseReactionShorthand = parseReactionShorthand;
exports.populateEmojiData = populateEmojiData;
exports.snakeCase = void 0;
var _validator = require("validator");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emojiMartToGemoji = exports.emojiMartToGemoji = {
  "+1": "thumbs_up",
  "-1": "thumbs_down"
};

/**
 * Convert kebab case to snake case.
 *
 * @param str The string to convert
 * @returns The converted string
 */
const snakeCase = str => str.replace(/(\w)-(\w)/g, "$1_$2");

/**
 * A map of emoji shortcode to emoji character. The shortcode is snake cased
 * for backwards compatibility with those already encoded into documents.
 * Populated lazily on first access to avoid loading @emoji-mart/data in the
 * initial bundle.
 */
exports.snakeCase = snakeCase;
let nameToEmoji = exports.nameToEmoji = {};
let emojiDataLoaded = false;

/**
 * Synchronously populate nameToEmoji from the given emoji data. This mutates
 * the existing object so references captured at init time (e.g. by
 * markdown-it-emoji) are also updated.
 *
 * @param data The emoji mart data to populate from.
 */
function populateEmojiData(data) {
  if (emojiDataLoaded) {
    return;
  }
  for (const emoji of Object.values(data.emojis)) {
    const convertedId = snakeCase(emoji.id);
    nameToEmoji[emojiMartToGemoji[convertedId] ?? convertedId] = emoji.skins[0].native;
  }
  emojiDataLoaded = true;
}

/**
 * Lazily load the emoji data and populate nameToEmoji. Use this on the client
 * to avoid including @emoji-mart/data in the initial bundle.
 *
 * @returns the populated nameToEmoji map.
 */
async function loadEmojiData() {
  if (emojiDataLoaded) {
    return nameToEmoji;
  }
  const {
    default: data
  } = await Promise.resolve().then(() => _interopRequireWildcard(require("@emoji-mart/data")));
  populateEmojiData(data);
  return nameToEmoji;
}

/**
 * Get the emoji character for a given emoji shortcode.
 *
 * @param name The emoji shortcode.
 * @returns the emoji character.
 */
const getEmojiFromName = name => nameToEmoji[name.replace(/:/g, "")] ?? "?";

/**
 * Get the emoji shortcode for a given emoji character.
 *
 * @param emoji The emoji character.
 * @returns the emoji shortcode.
 */
exports.getEmojiFromName = getEmojiFromName;
const getNameFromEmoji = emoji => Object.entries(nameToEmoji).find(_ref => {
  let [, value] = _ref;
  return value === emoji;
})?.[0];

/**
 * Resolve an emoji node name to the value used to react with.
 *
 * @param name The emoji shortcode, or a UUID for a custom emoji.
 * @returns the native emoji character, the UUID of a custom emoji, or undefined
 * when the name does not resolve to a known emoji.
 */
exports.getNameFromEmoji = getNameFromEmoji;
function getReactionFromName(name) {
  if (typeof name !== "string") {
    return undefined;
  }

  // Custom emojis are stored as UUIDs and reacted with directly.
  if ((0, _validator.isUUID)(name)) {
    return name;
  }
  const character = getEmojiFromName(name);
  return character === "?" ? undefined : character;
}

/**
 * Detect the "+:emoji:" reaction shorthand within a comment's document. When a
 * comment consists solely of a leading "+" immediately followed by a single
 * emoji it is treated as a request to react to the comment above rather than as
 * a new comment, mirroring the Slack shorthand.
 *
 * @param data The Prosemirror document of the draft comment.
 * @returns the emoji to react with — a native emoji character, or a UUID for a
 * custom emoji — or undefined when the document is not a reaction shorthand.
 */
function parseReactionShorthand(data) {
  const blocks = data.content ?? [];
  if (blocks.length !== 1) {
    return undefined;
  }
  const paragraph = blocks[0];
  if (paragraph.type !== "paragraph") {
    return undefined;
  }

  // Ignore whitespace-only text nodes so that "+ :emoji:" still matches.
  const inline = (paragraph.content ?? []).filter(node => !(node.type === "text" && !node.text?.trim()));

  // The common case: a "+" text node followed by an emoji node inserted via
  // the emoji menu.
  if (inline.length === 2) {
    const [prefix, emoji] = inline;
    if (prefix.type === "text" && prefix.text?.trim() === "+" && emoji.type === "emoji") {
      return getReactionFromName(emoji.attrs?.["data-name"]);
    }
    return undefined;
  }

  // Fallback: literal "+:shortcode:" text that was never converted to a node.
  if (inline.length === 1 && inline[0].type === "text") {
    const match = inline[0].text?.trim().match(/^\+\s*:([\w-]+):$/);
    if (match) {
      return getReactionFromName(match[1]);
    }
  }
  return undefined;
}