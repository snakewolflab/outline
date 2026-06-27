"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__setRequireDirectoryCache = __setRequireDirectoryCache;
exports.deserializeFilename = deserializeFilename;
exports.getFilenamesInDirectory = getFilenamesInDirectory;
exports.requireDirectory = requireDirectory;
exports.serializeFilename = serializeFilename;
exports.stringByteLength = stringByteLength;
exports.trimFilenameAndExt = trimFilenameAndExt;
var _nodePath = _interopRequireDefault(require("node:path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const windowsInvalidFileNameCharsRegex = /[\\/:*?"<>|]/g;
const windowsTrailingFileNameCharsRegex = /[. ]+$/g;
const encodedWindowsCharacters = {
  "%2F": "/",
  "%5C": "\\",
  "%3A": ":",
  "%2A": "*",
  "%3F": "?",
  "%22": '"',
  "%3C": "<",
  "%3E": ">",
  "%7C": "|",
  "%2E": ".",
  "%20": " "
};
const encodedWindowsCharactersRegex = /%(?:2F|5C|3A|2A|3F|22|3C|3E|7C|2E|20)/gi;

/**
 * Encodes a single character to uppercase percent-encoding.
 *
 * @param char The character to encode.
 * @returns The encoded character.
 */
function encodeWindowsUnsafeCharacter(char) {
  return `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`;
}

/**
 * Serialize a file name for inclusion in a ZIP.
 *
 * @param text The file name to serialize.
 * @returns The serialized file name.
 */
function serializeFilename(text) {
  const encoded = text.replace(windowsInvalidFileNameCharsRegex, encodeWindowsUnsafeCharacter);
  return encoded.replace(windowsTrailingFileNameCharsRegex, trailing => trailing.split("").map(encodeWindowsUnsafeCharacter).join(""));
}

/**
 * Deserialize a file name serialized with `serializeFilename`.
 *
 * @param text The file name to deserialize.
 * @returns The deserialized file name.
 */
function deserializeFilename(text) {
  return text.replace(encodedWindowsCharactersRegex, match => encodedWindowsCharacters[match.toUpperCase()] ?? match);
}

/**
 * Get the UTF8 byte length of a string.
 *
 * @param str The string to measure.
 * @returns The byte length of the string.
 */
function stringByteLength(str) {
  return Buffer.byteLength(str, "utf8");
}

/**
 * Safely slice a string to a maximum byte length without breaking UTF-8 characters.
 *
 * @param str The string to slice.
 * @param maxBytes The maximum byte length.
 * @returns The sliced string.
 */
function sliceStringToByteLength(str, maxBytes) {
  if (maxBytes <= 0) {
    return "";
  }
  const buffer = Buffer.from(str, "utf8");
  if (buffer.length <= maxBytes) {
    return str;
  }

  // Work backwards from maxBytes to find valid UTF-8 boundary
  for (let i = maxBytes; i > 0; i--) {
    const slice = buffer.subarray(0, i);
    const result = slice.toString("utf8");
    // Check if the result round-trips correctly (no replacement characters)
    if (Buffer.from(result, "utf8").equals(slice)) {
      return result;
    }
  }
  return "";
}

/**
 * Trim a file name to a maximum length, retaining the extension. The input
 * must be a filename only — passing a path (containing `/` or `\`) will throw.
 *
 * @param text The file name to trim.
 * @param length The maximum length of the file name in bytes.
 * @returns The trimmed file name.
 * @throws If `text` contains a path separator.
 */
function trimFilenameAndExt(text, length) {
  if (text.includes("/") || text.includes("\\")) {
    throw new Error("trimFilenameAndExt expects a filename without path separators");
  }
  if (Buffer.byteLength(text, "utf8") > length) {
    const ext = _nodePath.default.extname(text);
    const name = _nodePath.default.basename(text, ext);
    const extByteLength = Buffer.byteLength(ext, "utf8");
    const availableBytesForName = length - extByteLength;
    if (availableBytesForName <= 0) {
      // If extension is too long, trim the whole filename
      return sliceStringToByteLength(text, length);
    }
    const trimmedName = sliceStringToByteLength(name, availableBytesForName);
    return trimmedName + ext;
  }
  return text;
}

/**
 * Get a list of file names in a directory.
 *
 * @param dirName The directory to search.
 * @returns A list of file names in the directory.
 */
function getFilenamesInDirectory(dirName) {
  return _fsExtra.default.readdirSync(dirName).filter(file => file.indexOf(".") !== 0 && file.match(/\.[jt]s$/) && file !== _nodePath.default.basename(__filename) && !file.includes(".test"));
}

// Optional cache used in tests, where Node's require() cannot resolve
// TypeScript files with aliased imports. Populated by the test setup with
// modules pre-loaded via Vite's import.meta.glob, keyed by directory suffix.
const requireDirectoryCache = new Map();

/**
 * Pre-populate requireDirectory's module cache. Intended for use only by the
 * Vitest test setup; production code should not call this.
 *
 * @param suffix The directory path suffix to match against.
 * @param modules The eagerly-loaded modules.
 */
function __setRequireDirectoryCache(suffix, modules) {
  requireDirectoryCache.set(suffix, modules);
}

/**
 * Require all files in a directory and return them as an array of tuples.
 *
 * @param dirName The directory to search.
 * @returns An array of tuples containing the required files and their names.
 */
function requireDirectory(dirName) {
  for (const [suffix, modules] of requireDirectoryCache) {
    if (dirName.endsWith(suffix)) {
      return Object.entries(modules).filter(_ref => {
        let [filePath] = _ref;
        return !filePath.endsWith("/index.ts") && !filePath.endsWith("/index.js") && !filePath.includes(".test.");
      }).map(_ref2 => {
        let [filePath, mod] = _ref2;
        const base = filePath.split("/").pop() ?? filePath;
        const id = base.replace(/\.[jt]s$/, "");
        return [mod, id];
      });
    }
  }
  return getFilenamesInDirectory(dirName).map(fileName => {
    const filePath = _nodePath.default.join(dirName, fileName);
    const name = _nodePath.default.basename(filePath.replace(/\.[jt]s$/, ""));
    return [require(filePath), name];
  });
}