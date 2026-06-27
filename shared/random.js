"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomString = exports.randomInteger = exports.randomElement = void 0;
/**
 * Generate a random integer within a given range.
 *
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns A random integer within the range.
 */
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Choose a random element from an array.
 *
 * @param arr - The array to choose from.
 * @returns A random element from the array.
 */
exports.randomInteger = randomInteger;
const randomElement = arr => arr[randomInteger(0, arr.length - 1)];
exports.randomElement = randomElement;
/**
 * Generate a random string of a given length and charset.
 *
 * @param options - The length of the string or an object with options.
 * @returns A random string.
 */
const randomString = options => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeric = "0123456789";
  const length = typeof options === "number" ? options : options.length;
  const charset = typeof options === "number" ? "alphanumeric" : options.charset || "alphanumeric";
  const capitalization = typeof options === "number" ? "mixed" : options.capitalization || "mixed";
  const chars = charset === "numeric" ? numeric : charset === "alphabetic" ? capitalization === "lowercase" ? lowercase : capitalization === "uppercase" ? uppercase : lowercase + uppercase : capitalization === "lowercase" ? lowercase + numeric : capitalization === "uppercase" ? uppercase + numeric : lowercase + uppercase + numeric;
  const array = new Uint8Array(length);
  // oxlint-disable-next-line no-restricted-globals
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join("");
};
exports.randomString = randomString;