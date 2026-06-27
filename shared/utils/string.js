"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hashString = hashString;
exports.regexLastIndexOf = exports.regexIndexOf = void 0;
/**
 * Simple string hash using the djb2 algorithm, returns a hex string.
 *
 * @param str the string to hash.
 * @returns a hex-encoded 32-bit hash.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i) | 0;
  }
  return (hash >>> 0).toString(16);
}

/**
 * Returns the index of the first occurrence of a substring in a string that matches a regular expression.
 *
 * @param text The string to search in.
 * @param re The regular expression to search for.
 * @param startPos The position in the string at which to begin the search. Defaults to 0.
 */
const regexIndexOf = function (text, re, startPos) {
  startPos = startPos || 0;
  if (!re.global) {
    const flags = "g" + (re.multiline ? "m" : "") + (re.ignoreCase ? "i" : "");
    re = new RegExp(re.source, flags);
  }
  re.lastIndex = startPos;
  const match = re.exec(text);
  if (match) {
    return match.index;
  } else {
    return -1;
  }
};

/**
 * Returns the index of the last occurrence of a substring in a string that matches a regular expression.
 *
 * @param text The string to search in.
 * @param re The regular expression to search for.
 * @param startPos The position in the string at which to begin the search. Defaults to the end of the string.
 */
exports.regexIndexOf = regexIndexOf;
const regexLastIndexOf = function (text, re, startPos) {
  startPos = startPos === undefined ? text.length : startPos;
  if (!re.global) {
    const flags = "g" + (re.multiline ? "m" : "") + (re.ignoreCase ? "i" : "");
    re = new RegExp(re.source, flags);
  }
  let lastSuccess = -1;
  for (let pos = 0; pos <= startPos; pos++) {
    re.lastIndex = pos;
    const match = re.exec(text);
    if (!match) {
      break;
    }
    pos = match.index;
    if (pos <= startPos) {
      lastSuccess = pos;
    }
  }
  return lastSuccess;
};
exports.regexLastIndexOf = regexLastIndexOf;