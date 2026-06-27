"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
var _SearchProviderManager = _interopRequireDefault(require("../../utils/SearchProviderManager"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Processor that keeps the search index in sync with data changes.
 * For PostgreSQL this is largely a no-op since tsvector triggers handle
 * indexing, but external providers (Elasticsearch, etc.) rely on these
 * events to maintain their indexes.
 */
class SearchIndexProcessor extends _BaseProcessor.default {
  async perform(event) {
    const provider = _SearchProviderManager.default.getProvider();

    // When using the built-in Postgres search provider, tsvector triggers
    // handle indexing directly and the provider methods are effectively no-ops for now.
    if (process.env.SEARCH_PROVIDER === "postgres") {
      return;
    }
    switch (event.name) {
      case "documents.publish":
      case "documents.update.delayed":
      case "documents.unarchive":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (document) {
            await provider.index(_types.SearchableModel.Document, document);
          }
          break;
        }
      case "documents.archive":
      case "documents.delete":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });
          if (document) {
            await provider.updateMetadata(_types.SearchableModel.Document, document.id, {
              archivedAt: document.archivedAt,
              deletedAt: document.deletedAt
            });
          }
          break;
        }
      case "documents.permanent_delete":
        {
          await provider.remove(_types.SearchableModel.Document, event.documentId, event.teamId);
          break;
        }
      case "documents.move":
        {
          const movedEvent = event;
          for (const documentId of movedEvent.data.documentIds) {
            await provider.updateMetadata(_types.SearchableModel.Document, documentId, {
              collectionId: movedEvent.collectionId
            });
          }
          break;
        }
      case "collections.create":
      case "collections.update":
        {
          const collection = await _models.Collection.findByPk(event.collectionId);
          if (collection) {
            await provider.index(_types.SearchableModel.Collection, collection);
          }
          break;
        }
      case "collections.delete":
        {
          await provider.remove(_types.SearchableModel.Collection, event.collectionId, event.teamId);
          break;
        }
      case "comments.create":
      case "comments.update":
        {
          const comment = await _models.Comment.findByPk(event.modelId);
          if (comment) {
            await provider.index(_types.SearchableModel.Comment, comment);
          }
          break;
        }
      case "comments.delete":
        {
          await provider.remove(_types.SearchableModel.Comment, event.modelId, event.teamId);
          break;
        }
      default:
        break;
    }
  }
}
exports.default = SearchIndexProcessor;
_defineProperty(SearchIndexProcessor, "applicableEvents", ["documents.publish", "documents.update.delayed", "documents.archive", "documents.unarchive", "documents.delete", "documents.permanent_delete", "documents.move", "collections.create", "collections.update", "collections.delete", "comments.create", "comments.update", "comments.delete"]);