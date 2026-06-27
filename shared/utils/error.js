"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errToString = errToString;
exports.toError = toError;
/**
 * Coerce an unknown value, such as a value caught in a try/catch, to an Error.
 *
 * @param value the value to coerce, typically a caught error.
 * @returns the value itself when it is already an Error, otherwise a new Error wrapping its string representation.
 */
function toError(value) {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * Extract a human-readable message from an unknown value, such as a value caught in a try/catch.
 *
 * @param value the value to read a message from, typically a caught error.
 * @returns the Error's message when it is an Error, otherwise its string representation.
 */
function errToString(value) {
  return value instanceof Error ? value.message : String(value);
}