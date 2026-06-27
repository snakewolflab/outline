"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseSearchProvider = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Abstract base class for search providers. Implementations handle full-text
 * search, title search, collection search, and index management.
 */
class BaseSearchProvider {
  constructor() {
    /** Unique identifier for this provider, matched against `SEARCH_PROVIDER` env var. */
    _defineProperty(this, "id", void 0);
  }
  /**
   * Perform a full-text search scoped to a user's accessible documents.
   *
   * @param user - the user performing the search.
   * @param options - search options.
   * @returns search results with ranking and context.
   */
  /**
   * Perform a full-text search scoped to a team (used for shared document search).
   *
   * @param team - the team to search within.
   * @param options - search options.
   * @returns search results with ranking and context.
   */
  /**
   * Search document titles for a user (used for link suggestions, quick search).
   *
   * @param user - the user performing the search.
   * @param options - search options.
   * @returns matching documents.
   */
  /**
   * Search collections for a user.
   *
   * @param user - the user performing the search.
   * @param options - search options.
   * @returns matching collections.
   */
  /**
   * Index or re-index a searchable item. For providers that rely on database
   * triggers (e.g. PostgreSQL tsvector), this may be a no-op.
   *
   * @param model - the type of model being indexed.
   * @param item - the model instance to index.
   */
  /**
   * Remove an item from the search index.
   *
   * @param model - the type of model being removed.
   * @param id - the id of the item to remove.
   * @param teamId - the team id the item belongs to.
   */
  /**
   * Update metadata for an indexed item without re-indexing the full content.
   * Useful for permission changes, moves, archive/unarchive.
   *
   * @param model - the type of model being updated.
   * @param id - the id of the item to update.
   * @param metadata - the metadata fields to update.
   */
}
exports.BaseSearchProvider = BaseSearchProvider;