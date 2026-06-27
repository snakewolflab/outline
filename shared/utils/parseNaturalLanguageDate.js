"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseNaturalLanguageDate = parseNaturalLanguageDate;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Type-only import is fully erased at compile time, so it does not pull
// chrono-node into the bundle.

/**
 * chrono-node is a sizeable dependency, so it is loaded lazily on first use
 * via a dynamic import. The bundler splits it into its own chunk that is only
 * fetched when a date actually needs to be parsed (i.e. when the user types in
 * the mention menu), keeping it out of the main bundle.
 */
let chronoPromise;
function loadChrono() {
  if (!chronoPromise) {
    chronoPromise = Promise.resolve().then(() => _interopRequireWildcard(require("chrono-node"))).catch(err => {
      // Don't cache a rejected import (e.g. a transient chunk-load failure),
      // otherwise every subsequent parse would reuse the failure. Clearing it
      // lets the next call retry.
      chronoPromise = undefined;
      throw err;
    });
  }
  return chronoPromise;
}

/**
 * Parse a natural language string such as "tomorrow", "next friday",
 * "jan 2" or "in 3 days" into a calendar date.
 *
 * The time component is intentionally discarded as date mentions are
 * day-granular; only the year, month and day of the matched date are
 * returned. chrono-node is loaded asynchronously the first time this is
 * called.
 *
 * @param input the natural language string to parse.
 * @param referenceDate the date relative to which terms like "tomorrow"
 * are resolved, defaults to now.
 * @returns a promise resolving to the matched date with the time set to
 * local midnight, or null when no date could be confidently parsed.
 */
async function parseNaturalLanguageDate(input) {
  let referenceDate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const chrono = await loadChrono();
  const results = chrono.parse(trimmed, referenceDate, {
    forwardDate: true
  });
  const result = results[0];
  if (!result) {
    return null;
  }

  // Only accept matches that span (roughly) the whole input so that
  // unrelated text typed after "@" does not accidentally resolve to a date.
  if (result.text.trim().length < trimmed.length) {
    return null;
  }
  const date = result.start.date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}