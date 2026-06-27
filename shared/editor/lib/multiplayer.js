"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRemoteTransaction = isRemoteTransaction;
exports.mapDecorations = mapDecorations;
var _yProsemirror = require("y-prosemirror");
var _prosemirrorRecreateTransform = require("./prosemirror-recreate-transform");
/**
 * Checks if a transaction is a remote transaction
 *
 * @param tr The Prosemirror transaction
 * @returns true if the transaction is a remote transaction
 */
function isRemoteTransaction(tr) {
  const meta = tr.getMeta(_yProsemirror.ySyncPluginKey);

  // This logic seems to be flipped? But it's correct.
  return !!meta?.isChangeOrigin;
}

/**
 * Map the set of decorations in response to a change in the document.
 *
 * @param set The current set of decorations
 * @param tr The Prosemirror transaction
 * @param force Whether to force recalculation for map even for local transactions
 * @returns The mapped set of decorations
 */
function mapDecorations(set, tr) {
  let force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  let mapping = tr.mapping;
  const hasDecorations = set.find().length;
  if (hasDecorations && (isRemoteTransaction(tr) || force)) {
    try {
      mapping = (0, _prosemirrorRecreateTransform.recreateTransform)(tr.before, tr.doc, {
        complexSteps: true,
        wordDiffs: false,
        simplifyDiff: true
      }).mapping;
    } catch (err) {
      // oxlint-disable-next-line no-console
      console.warn("Failed to recreate transform: ", err);
    }
  }
  return set.map(mapping, tr.doc);
}