"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChangesetHelper = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorChangeset = require("prosemirror-changeset");
var _prosemirrorTransform = require("prosemirror-transform");
var _ExtensionManager = _interopRequireDefault(require("./ExtensionManager"));
var _prosemirrorRecreateTransform = require("./prosemirror-recreate-transform");
var _nodes = require("../nodes");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * The structural subset of a changeset `Change` that this module reads and
 * produces. Using a `Pick` rather than the `Change` class avoids requiring
 * class-only members (such as `toJSON`) on the plain objects we build.
 */

/**
 * The maximum number of unchanged characters allowed between two adjacent
 * changes for them to still be merged into a single change. This is
 * deliberately small: merging absorbs the gap into the diff, so any unchanged
 * text within it is rendered as deleted/reinserted. A value of 3 is the
 * minimum that rejoins hyphenated word fragments such as replacing
 * "no-await-in-loop", where the differ aligns the shared "no" and leaves an
 * unchanged "no-" (gap of 3) between fragments, without swallowing longer
 * unchanged words.
 */
const MAX_UNCHANGED_GAP = 3;

/**
 * Merges adjacent Change objects that represent interleaved deletions/insertions.
 *
 * When word-level diffing is used, replacing "no-await-in-loop" with
 * "jsx-no-jsx-as-prop" can produce multiple adjacent Change objects like:
 *   Change1: delete "no", insert "jsx"
 *   Change2: delete "await", insert "no"
 *   ...
 *
 * This function merges such adjacent changes into a single change:
 *   Change: delete "no-await-in-loop", insert "jsx-no-jsx-as-prop"
 *
 * @param changes - The changes from simplifyChanges
 * @param docOld - The old document (to extract merged deletion content)
 * @returns Changes with adjacent interleaved changes merged
 */
function mergeInterleavedChanges(changes, docOld) {
  if (changes.length <= 1) {
    return [...changes];
  }
  const result = [];
  let i = 0;
  while (i < changes.length) {
    const current = changes[i];

    // Check if this change and subsequent changes form a contiguous replacement
    // (i.e., they're adjacent in both old and new document positions)
    let j = i + 1;
    while (j < changes.length) {
      const prev = changes[j - 1];
      const next = changes[j];

      // Check if changes are adjacent (toA of prev equals fromA of next, same for B)
      // Allow gaps (like hyphens or other unchanged characters between changes)
      const gapA = next.fromA - prev.toA;
      const gapB = next.fromB - prev.toB;

      // Check if changes are in the same parent node (e.g., same table cell, same paragraph)
      // by verifying that the gap in the old document doesn't cross node boundaries
      let crossesNodeBoundary = false;
      if (gapA > 0) {
        try {
          // If the gap contains any non-text node, it crosses a boundary
          const gap = docOld.slice(prev.toA, next.fromA).content;
          for (let n = 0; n < gap.childCount; n++) {
            if (!gap.child(n).isText) {
              crossesNodeBoundary = true;
              break;
            }
          }
        } catch {
          crossesNodeBoundary = true;
        }
      }

      // If gaps are equal, reasonably small, and don't cross node boundaries,
      // they're part of the same logical replacement
      if (gapA === gapB && gapA >= 0 && gapA <= MAX_UNCHANGED_GAP && !crossesNodeBoundary) {
        j++;
      } else {
        break;
      }
    }

    // The merged change only needs the first deletion/insertion in the window
    // to carry forward the originating step; the spans themselves are
    // recomputed from the window bounds below.
    let firstDeleted;
    let firstInserted;
    for (let k = i; k < j; k++) {
      firstDeleted ??= changes[k].deleted[0];
      firstInserted ??= changes[k].inserted[0];
    }

    // Merge the window only when it is a genuine replacement — it must contain
    // both a deletion and an insertion. Otherwise a cluster of pure insertions
    // (or pure deletions) separated by a short unchanged gap would merge and
    // render the unchanged text between them as inserted/deleted.
    if (j > i + 1 && firstDeleted && firstInserted) {
      const lastChange = changes[j - 1];

      // Create merged change. The deletion slice holds the original (old) text
      // spanning the whole window so it renders as one block; it is not treated
      // as a modification downstream because its text differs from the insertion.
      const mergedChange = {
        fromA: current.fromA,
        toA: lastChange.toA,
        fromB: current.fromB,
        toB: lastChange.toB,
        deleted: [{
          length: lastChange.toA - current.fromA,
          data: {
            ...firstDeleted.data,
            slice: docOld.slice(current.fromA, lastChange.toA)
          }
        }],
        inserted: [{
          length: lastChange.toB - current.fromB,
          data: firstInserted.data
        }]
      };
      result.push(mergedChange);
      i = j;
    } else {
      result.push(current);
      i++;
    }
  }
  return result;
}

/**
 * Represents a modification (attribute change) in the document.
 */

/**
 * Extended Change type that includes modifications.
 */

class AttributeEncoder {
  encodeCharacter(char, marks) {
    return `${char}:${this.encodeMarks(marks)}`;
  }
  encodeNodeStart(node) {
    const nodeName = node.type.name;
    const marks = node.marks;

    // Add node attributes if they exist
    let nodeStr = nodeName;

    // Enable more attribute encoding as tested
    if (Object.keys(node.attrs).length) {
      nodeStr += ":" + JSON.stringify(node.attrs);
    }
    if (!marks.length) {
      return nodeStr;
    }
    return `${nodeStr}:${this.encodeMarks(marks)}`;
  }

  // See: https://github.com/ProseMirror/prosemirror-changeset/blob/23f67c002e5489e454a0473479e407decb238afe/src/diff.ts#L26
  encodeNodeEnd(_ref) {
    let {
      type
    } = _ref;
    let cache = type.schema.cached.changeSetIDs || (type.schema.cached.changeSetIDs = Object.create(null));
    let id = cache[type.name];
    if (id === null) {
      cache[type.name] = id = Object.keys(type.schema.nodes).indexOf(type.name) + 1;
    }
    return id;
  }
  compareTokens(a, b) {
    return a === b;
  }
  encodeMarks(marks) {
    return marks.map(m => {
      let result = m.type.name;
      if (Object.keys(m.attrs).length) {
        result += ":" + JSON.stringify(m.attrs);
      }
      return result;
    }).sort().join(",");
  }
}
class ChangesetHelper {
  /**
   * Calculates a changeset between two revisions of a document.
   *
   * @param revision - The current revision data.
   * @param previousRevision - The previous revision data to compare against.
   * @returns An object containing the simplified changes and the new document.
   */
  static getChangeset(revision, previousRevision) {
    if (!revision || !previousRevision) {
      // This is the first revision, nothing to compare against
      return null;
    }
    try {
      // Create schema from extensions
      const extensionManager = new _ExtensionManager.default((0, _nodes.withComments)(_nodes.richExtensions));
      const schema = new _prosemirrorModel.Schema({
        nodes: extensionManager.nodes,
        marks: extensionManager.marks
      });

      // Parse documents from JSON (old = previous revision, new = current revision)
      const docOld = _prosemirrorModel.Node.fromJSON(schema, previousRevision);
      const docNew = _prosemirrorModel.Node.fromJSON(schema, revision);

      // Calculate the transform and changeset
      const tr = (0, _prosemirrorRecreateTransform.recreateTransform)(docOld, docNew, {
        complexSteps: false,
        wordDiffs: true,
        simplifyDiff: true
      });

      // Map steps to capture the actual content being replaced from the document
      // state at that specific step. This ensures deleted content is correctly
      // captured for diff rendering.
      const changeset = _prosemirrorChangeset.ChangeSet.create(docOld, undefined, this.attributeEncoder).addSteps(tr.doc, tr.mapping.maps, tr.steps.map((step, i) => ({
        step,
        slice: step instanceof _prosemirrorTransform.ReplaceStep ? tr.docs[i].slice(step.from, step.to) : null
      })));

      // Merge interleaved deletions/insertions into cleaner blocks
      const changes = mergeInterleavedChanges((0, _prosemirrorChangeset.simplifyChanges)(changeset.changes, docNew), docOld);

      // Post-process changes to detect modifications (attribute-only changes)
      const extendedChanges = changes.map(change => {
        const modified = [];
        const matchedDeletionIndices = new Set();
        const matchedInsertionIndices = new Set();

        // Each deletion entry contains both old (step.slice) and new (slice) content
        // Check if the deletion represents a modification by comparing these
        for (let i = 0; i < change.deleted.length; i++) {
          const deletion = change.deleted[i];
          if (!deletion.data.slice || !deletion.data.step.slice) {
            continue;
          }

          // deletion.data.step.slice = OLD content (what was in the document)
          // deletion.data.slice = NEW content (what it changed to)
          const oldSlice = deletion.data.step.slice;
          const newSlice = deletion.data.slice;

          // Check if both slices have the same number of nodes
          if (oldSlice.content.childCount === newSlice.content.childCount && oldSlice.content.childCount > 0) {
            let isModification = true;
            const nodes = [];

            // Check each corresponding node pair
            for (let index = 0; index < oldSlice.content.childCount; index++) {
              const oldNode = oldSlice.content.child(index);
              const newNode = newSlice.content.child(index);

              // For modifications, we allow:
              // 1. Same node type with different attributes (e.g., code_block language change)
              // 2. Related node types with same semantic group (e.g., td <-> th share "tableCell" group)
              const isSameType = oldNode.type.name === newNode.type.name;

              // Check if nodes share a common semantic group (excluding generic "block"/"inline")
              const getSemanticGroups = node => {
                const groups = node.type.spec.group?.split(" ") || [];
                return new Set(groups.filter(g => g !== "block" && g !== "inline"));
              };
              const oldGroups = getSemanticGroups(oldNode);
              const newGroups = getSemanticGroups(newNode);
              const hasSharedGroup = Array.from(oldGroups).some(g => newGroups.has(g));
              const isRelatedNodeType = !isSameType && hasSharedGroup;
              try {
                if (oldNode.textContent !== newNode.textContent || !isSameType && !isRelatedNodeType) {
                  isModification = false;
                } else if (isSameType && JSON.stringify(oldNode.attrs) === JSON.stringify(newNode.attrs)) {
                  // Same type and same attributes = not a modification
                  isModification = false;
                }
                nodes.push({
                  oldNode,
                  newNode
                });
              } catch {
                isModification = false;
              }
            }
            if (isModification) {
              modified.push({
                length: deletion.length,
                data: {
                  step: deletion.data.step,
                  slice: deletion.data.slice,
                  oldAttrs: nodes.length === 1 ? nodes[0].oldNode.attrs : {},
                  newAttrs: nodes.length === 1 ? nodes[0].newNode.attrs : {}
                }
              });

              // Mark this deletion for removal
              matchedDeletionIndices.add(i);

              // Also find and mark corresponding insertion for removal
              for (let j = 0; j < change.inserted.length; j++) {
                const insertion = change.inserted[j];
                if (insertion.length === deletion.length && !matchedInsertionIndices.has(j)) {
                  matchedInsertionIndices.add(j);
                  break;
                }
              }
            }
          }
        }
        return Object.assign({}, change, {
          deleted: change.deleted.filter((_, index) => !matchedDeletionIndices.has(index)),
          inserted: change.inserted.filter((_, index) => !matchedInsertionIndices.has(index)),
          modified
        });
      });
      return {
        changes: extendedChanges,
        doc: tr.doc
      };
    } catch {
      return null;
    }
  }
}
exports.ChangesetHelper = ChangesetHelper;
_defineProperty(ChangesetHelper, "attributeEncoder", new AttributeEncoder());