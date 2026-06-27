"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.documentTools = documentTools;
exports.presentDocument = presentDocument;
var _zod = require("zod");
var _documentCreator = _interopRequireWildcard(require("../commands/documentCreator"));
var _documentMover = _interopRequireDefault(require("../commands/documentMover"));
var _documentRestorer = _interopRequireDefault(require("../commands/documentRestorer"));
var _documentUpdater = _interopRequireDefault(require("../commands/documentUpdater"));
var _models = require("../models");
var _database = require("../storage/database");
var _policies = require("../policies");
var _presenters = require("../presenters");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _UrlHelper = require("../../shared/utils/UrlHelper");
var _util = require("./util");
var _types = require("../../shared/types");
var _SearchProviderManager = _interopRequireDefault(require("../utils/SearchProviderManager"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Presents a document for a tool response. Adds MCP-specific fields
 * on top of the standard document presenter.
 *
 * @param document - the document to present.
 * @param options - optional presenter options
 * @returns the presented document object.
 */
function presentDocument(document) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, _presenters.presentDocument)(undefined, document, options);
}

/**
 * Registers document-related MCP tools on the given server, filtered by
 * the OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function documentTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("documents.list", scopes)) {
    server.registerTool("list_documents", {
      title: "Search documents",
      description: "Searches documents the user has access to. Performs full-text search across document content when a query is provided, or lists recent documents when no query is given. Optionally filter by collection. To retrieve the full contents or hierarchy of a specific collection, use list_collection_documents instead.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        query: (0, _util.optionalString)().describe("A search query to find documents by content or title. When omitted, returns recent documents."),
        collectionId: (0, _util.optionalString)().describe("A collection ID to filter documents by."),
        offset: _zod.z.coerce.number().int().min(0).optional().describe("The pagination offset. Defaults to 0."),
        limit: _zod.z.coerce.number().int().min(1).max(100).optional().describe("The maximum number of results to return. Defaults to 25, max 100.")
      }
    }, (0, _util.withTracing)("list_documents", async (_ref, extra) => {
      let {
        query,
        collectionId,
        offset,
        limit
      } = _ref;
      try {
        const user = (0, _util.getActorFromContext)(extra);
        const effectiveOffset = offset ?? 0;
        const effectiveLimit = limit ?? 25;
        let indexMap;
        if (collectionId) {
          const collection = await _models.Collection.findByPk(collectionId, {
            userId: user.id,
            includeDocumentStructure: true
          });
          (0, _policies.authorize)(user, "readDocument", collection);
          if (collection?.documentStructure) {
            indexMap = (0, _util.buildSiblingIndexMap)(collection.documentStructure);
          }
        }
        if (query) {
          const searchProvider = _SearchProviderManager.default.getProvider();

          // If the query looks like a document ID or urlId, try direct
          // lookup first so exact matches appear at the top of results.
          let exactMatch = null;
          if (_UrlHelper.UrlHelper.SLUG_URL_REGEX.test(query)) {
            exactMatch = await _models.Document.findByPk(query, {
              userId: user.id
            });
            if (exactMatch && !(0, _policies.can)(user, "read", exactMatch)) {
              exactMatch = null;
            }
            if (exactMatch && collectionId && exactMatch.collectionId !== collectionId) {
              exactMatch = null;
            }
          }
          const {
            results
          } = await searchProvider.searchForUser(user, {
            query,
            collectionId,
            offset: effectiveOffset,
            limit: effectiveLimit
          });
          const filteredResults = results.filter(result => result.document.id !== exactMatch?.id);
          const breadcrumbs = await (0, _util.getBreadcrumbsForDocuments)([...(exactMatch ? [exactMatch] : []), ...filteredResults.map(r => r.document)], user);
          const presented = await Promise.all(filteredResults.map(async result => {
            const doc = (0, _util.pathToUrl)(user.team, await presentDocument(result.document, {
              includeData: false,
              includeText: false
            }));
            const breadcrumb = breadcrumbs.get(result.document.id);
            const siblingIndex = indexMap?.get(result.document.id);
            return {
              document: doc,
              ...(breadcrumb !== undefined && {
                breadcrumb
              }),
              context: result.context,
              ...(siblingIndex !== undefined && {
                index: siblingIndex
              })
            };
          }));
          if (exactMatch) {
            const doc = (0, _util.pathToUrl)(user.team, await presentDocument(exactMatch, {
              includeData: false,
              includeText: false
            }));
            const breadcrumb = breadcrumbs.get(exactMatch.id);
            const siblingIndex = indexMap?.get(exactMatch.id);
            presented.unshift({
              document: doc,
              ...(breadcrumb !== undefined && {
                breadcrumb
              }),
              context: undefined,
              ...(siblingIndex !== undefined && {
                index: siblingIndex
              })
            });
          }
          return (0, _util.success)(presented);
        }

        // List recent documents via the search provider (with no query) so
        // access control matches the search path exactly.
        const searchProvider = _SearchProviderManager.default.getProvider();
        const {
          results
        } = await searchProvider.searchForUser(user, {
          collectionId,
          offset: effectiveOffset,
          limit: effectiveLimit,
          statusFilter: [_types.StatusFilter.Published]
        });
        const documents = results.map(result => result.document);
        const breadcrumbs = await (0, _util.getBreadcrumbsForDocuments)(documents, user);
        const presented = await Promise.all(documents.map(async document => {
          const doc = (0, _util.pathToUrl)(user.team, await presentDocument(document, {
            includeData: false,
            includeText: false
          }));
          const breadcrumb = breadcrumbs.get(document.id);
          const siblingIndex = indexMap?.get(document.id);
          return {
            document: doc,
            ...(breadcrumb !== undefined && {
              breadcrumb
            }),
            ...(siblingIndex !== undefined && {
              index: siblingIndex
            })
          };
        }));
        return (0, _util.success)(presented);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("collections.documents", scopes)) {
    server.registerTool("list_collection_documents", {
      title: "List all documents in a collection",
      description: "Returns the complete hierarchical tree of published documents in a collection, including nested sub-documents. Use this to enumerate every document in a collection or to understand parent/child relationships. Drafts and archived documents are not included.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        collectionId: _zod.z.string().describe("The ID of the collection whose document tree to return.")
      }
    }, (0, _util.withTracing)("list_collection_documents", async (_ref2, extra) => {
      let {
        collectionId
      } = _ref2;
      try {
        const user = (0, _util.getActorFromContext)(extra);
        const collection = await _models.Collection.findByPk(collectionId, {
          userId: user.id,
          rejectOnEmpty: true
        });
        (0, _policies.authorize)(user, "readDocument", collection);
        const documentStructure = await collection.getCachedDocumentStructure();
        const tree = (documentStructure ?? []).map(node => (0, _presenters.presentNavigationNode)(user.team, node));
        return (0, _util.success)(tree);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("documents.create", scopes)) {
    server.registerTool("create_document", {
      title: "Create document",
      description: "Creates a new document. Requires a collectionId to place the document in a collection, or parentDocumentId to nest it under an existing document. Pass a templateId (from list_templates) to pre-fill the document from a template; the template's content is used unless text is also provided.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        title: (0, _util.optionalString)().describe("The title of the document. Defaults to the template's title when a templateId is provided."),
        text: _zod.z.string().optional().describe("The markdown content of the document."),
        collectionId: (0, _util.optionalString)().describe("The collection to place the document in."),
        parentDocumentId: (0, _util.optionalString)().describe("The parent document ID to nest this document under."),
        templateId: (0, _util.optionalString)().describe("The ID of a template to pre-fill the new document from. The template's title, content, icon, and color are used unless overridden by the corresponding parameters."),
        icon: (0, _util.optionalString)().describe("An icon for the document, e.g. an emoji."),
        color: (0, _util.optionalString)().describe("The hex color for the document icon, e.g. #FF0000."),
        publish: _zod.z.boolean().optional().describe("Whether to publish the document. Defaults to true. Set to false to create as a draft."),
        fullWidth: _zod.z.boolean().optional().describe("Whether the document should occupy full width of the screen. Defaults to false.")
      }
    }, (0, _util.withTracing)("create_document", async (input, context) => {
      try {
        const {
          collectionId,
          parentDocumentId,
          templateId
        } = input;
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const {
          collection
        } = await (0, _documentCreator.authorizeDocumentCreate)(ctx, {
          collectionId,
          parentDocumentId
        });
        let template;
        if (templateId) {
          template = await _models.Template.findByPk(templateId, {
            userId: user.id
          });
          (0, _policies.authorize)(user, "read", template);
        }
        const document = await (0, _documentCreator.default)(ctx, {
          title: input.title,
          text: input.text,
          icon: input.icon,
          color: input.color,
          parentDocumentId: parentDocumentId,
          publish: input.publish !== false,
          collectionId: collection?.id,
          template,
          fullWidth: input.fullWidth
        });
        const [{
          text,
          ...attributes
        }, breadcrumb] = await Promise.all([presentDocument(document, {
          includeData: false,
          includeText: true,
          includeUpdatedAt: true
        }), (0, _util.getDocumentBreadcrumb)(document, user)]);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              document: (0, _util.pathToUrl)(user.team, attributes),
              ...(breadcrumb !== undefined && {
                breadcrumb
              })
            })
          }, {
            type: "text",
            text: typeof text === "string" ? text : ""
          }]
        };
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("documents.move", scopes)) {
    server.registerTool("move_document", {
      title: "Move document",
      description: "Moves a document to a different location or reorders it within its current parent. Provide a collectionId to move to the root of a collection, a parentDocumentId to nest under another document, and/or an index to control position among siblings.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the document to move."),
        collectionId: (0, _util.optionalString)().describe("The destination collection ID. Required if parentDocumentId is not provided."),
        parentDocumentId: (0, _util.optionalString)().describe("The ID of the document to nest this document under. The document will be moved to the parent's collection."),
        index: _zod.z.number().int().min(0).optional().describe("The zero-based position to insert the document among its siblings. Use this to reorder documents within the same collection and parent. Omit to place at the end.")
      }
    }, (0, _util.withTracing)("move_document", async (input, context) => {
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        return await _database.sequelize.transaction(async transaction => {
          ctx.state.transaction = transaction;
          ctx.context.transaction = transaction;
          const document = await _models.Document.findByPk(input.id, {
            userId: user.id,
            rejectOnEmpty: true,
            transaction
          });
          (0, _policies.authorize)(user, "move", document);
          let collectionId = input.collectionId;
          if (input.parentDocumentId) {
            if (input.parentDocumentId === input.id) {
              return (0, _util.error)("Cannot nest a document inside itself");
            }
            const parent = await _models.Document.findByPk(input.parentDocumentId, {
              userId: user.id,
              rejectOnEmpty: true,
              transaction
            });
            (0, _policies.authorize)(user, "update", parent);
            collectionId = parent.collectionId;
            if (!parent.publishedAt) {
              return (0, _util.error)("Cannot move document inside a draft");
            }
          } else if (!collectionId) {
            return (0, _util.error)("Either collectionId or parentDocumentId is required");
          } else {
            const collection = await _models.Collection.findByPk(collectionId, {
              userId: user.id,
              rejectOnEmpty: true,
              transaction
            });
            (0, _policies.authorize)(user, "updateDocument", collection);
          }
          const {
            documents,
            collections
          } = await (0, _documentMover.default)(ctx, {
            document,
            collectionId: collectionId ?? null,
            parentDocumentId: input.parentDocumentId ?? null,
            index: input.index
          });
          const indexMap = new Map();
          for (const col of collections) {
            if (col.documentStructure) {
              for (const [id, idx] of (0, _util.buildSiblingIndexMap)(col.documentStructure)) {
                indexMap.set(id, idx);
              }
            }
          }
          const breadcrumbs = await (0, _util.getBreadcrumbsForDocuments)(documents, user);
          const presented = await Promise.all(documents.map(async document => {
            const doc = (0, _util.pathToUrl)(user.team, await presentDocument(document, {
              includeData: false,
              includeText: false
            }));
            const breadcrumb = breadcrumbs.get(document.id);
            const siblingIndex = indexMap.get(document.id);
            return {
              document: doc,
              ...(breadcrumb !== undefined && {
                breadcrumb
              }),
              ...(siblingIndex !== undefined && {
                index: siblingIndex
              })
            };
          }));
          return (0, _util.success)(presented);
        });
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("documents.update", scopes)) {
    server.registerTool("update_document", {
      title: "Update document",
      description: 'Updates an existing document by its ID. Only the fields provided will be updated. IMPORTANT: When editing an existing document\'s content, always prefer editMode "patch" with findText and text — this surgically replaces only the matched section and preserves all rich formatting (highlights, comments, table widths, etc) in the rest of the document. Using "replace" will overwrite the entire document and lose any formatting that cannot be represented in markdown.',
      annotations: {
        idempotentHint: true,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the document to update."),
        title: (0, _util.optionalString)().describe("The new title for the document."),
        text: _zod.z.string().optional().describe('The markdown content to apply. In "replace" mode this becomes the entire document. In "append"/"prepend" mode it is added to the end/beginning. In "patch" mode this is the replacement text for the matched findText.'),
        editMode: _zod.z.enum(_types.TextEditMode).optional().describe('How to apply the text update. "replace" (default) replaces the entire document content. "append" adds text to the end. "prepend" adds text to the beginning. "patch" finds the exact markdown specified in findText and replaces only that portion, preserving the rest of the document including any rich formatting that cannot be represented in markdown.'),
        findText: (0, _util.optionalString)().describe('Required when editMode is "patch". The exact markdown substring to find in the document. This should be copied verbatim from the document\'s existing markdown content. The first occurrence will be replaced with the text parameter. Can span multiple blocks (paragraphs, headings, etc).'),
        collectionId: (0, _util.optionalString)().describe("The collection ID to publish a draft to, required when publishing a draft that has no collection."),
        icon: _zod.z.string().nullable().optional().describe("An icon for the document, e.g. an emoji. Set to null to remove."),
        color: _zod.z.string().nullable().optional().describe("The hex color for the document icon. Set to null to remove."),
        publish: _zod.z.boolean().optional().describe("Set to true to publish a draft document, or false to convert a published document back to a draft."),
        fullWidth: _zod.z.boolean().optional().describe("Whether the document should occupy full width of the screen.")
      }
    }, (0, _util.withTracing)("update_document", async (input, context) => {
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const document = await _models.Document.findByPk(input.id, {
          userId: user.id,
          includeState: true,
          rejectOnEmpty: true
        });
        let updated;
        if (input.publish === false) {
          (0, _policies.authorize)(user, "unpublish", document);
          updated = await document.unpublishWithCtx(ctx, {
            detach: false
          });
        } else {
          (0, _policies.authorize)(user, "update", document);
          if (input.publish) {
            await (0, _documentCreator.authorizeDocumentPublish)(ctx, document, input.collectionId);
          }
          updated = await (0, _documentUpdater.default)(ctx, {
            document,
            ...input
          });
        }
        const [{
          text,
          ...attributes
        }, breadcrumb] = await Promise.all([presentDocument(updated, {
          includeData: false,
          includeText: true,
          includeUpdatedAt: true
        }), (0, _util.getDocumentBreadcrumb)(updated, user)]);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              document: (0, _util.pathToUrl)(user.team, attributes),
              ...(breadcrumb !== undefined && {
                breadcrumb
              })
            })
          }, {
            type: "text",
            text: typeof text === "string" ? text : ""
          }]
        };
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("documents.delete", scopes)) {
    server.registerTool("delete_document", {
      title: "Delete document",
      description: "Deletes a document by its ID. The document is moved to the trash and can be restored later. Set archive to true to archive the document instead of deleting it.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the document to delete."),
        archive: _zod.z.boolean().optional().describe("Set to true to archive the document instead of deleting it. Archived documents remain searchable in the archive view.")
      }
    }, (0, _util.withTracing)("delete_document", async (_ref3, context) => {
      let {
        id,
        archive
      } = _ref3;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        await _database.sequelize.transaction(async transaction => {
          ctx.state.transaction = transaction;
          ctx.context.transaction = transaction;
          const document = await _models.Document.findByPk(id, {
            userId: user.id,
            rejectOnEmpty: true,
            transaction
          });
          if (archive) {
            (0, _policies.authorize)(user, "archive", document);
            await document.archiveWithCtx(ctx);
          } else {
            (0, _policies.authorize)(user, "delete", document);
            await document.destroyWithCtx(ctx);
          }
        });
        return (0, _util.success)({
          success: true
        });
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("documents.restore", scopes)) {
    server.registerTool("restore_document", {
      title: "Restore document",
      description: "Restores an archived or trashed document, making it active again. Optionally provide a collectionId to restore the document into a different collection; otherwise it returns to its original collection.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the document to restore."),
        collectionId: (0, _util.optionalString)().describe("The collection to restore the document into. Defaults to its original collection.")
      }
    }, (0, _util.withTracing)("restore_document", async (_ref4, context) => {
      let {
        id,
        collectionId
      } = _ref4;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        return await _database.sequelize.transaction(async transaction => {
          ctx.state.transaction = transaction;
          ctx.context.transaction = transaction;
          const document = await _models.Document.findByPk(id, {
            userId: user.id,
            paranoid: false,
            rejectOnEmpty: true,
            transaction
          });
          if (!document.deletedAt && !document.archivedAt) {
            return (0, _util.error)("Document is not archived or trashed");
          }
          await (0, _documentRestorer.default)(ctx, {
            document,
            collectionId
          });
          const [{
            text,
            ...attributes
          }, breadcrumb] = await Promise.all([presentDocument(document, {
            includeData: false,
            includeText: true,
            includeUpdatedAt: true
          }), (0, _util.getDocumentBreadcrumb)(document, user)]);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                document: (0, _util.pathToUrl)(user.team, attributes),
                ...(breadcrumb !== undefined && {
                  breadcrumb
                })
              })
            }, {
              type: "text",
              text: typeof text === "string" ? text : ""
            }]
          };
        });
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
}