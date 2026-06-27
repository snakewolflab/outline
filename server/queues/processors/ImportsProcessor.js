"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PagePerImportTask = void 0;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _compat = require("es-toolkit/compat");
var _prosemirrorModel = require("prosemirror-model");
var _sequelize = require("sequelize");
var _nodeCrypto = require("node:crypto");
var _random = require("../../../shared/random");
var _types = require("../../../shared/types");
var _collections = require("../../../shared/utils/collections");
var _UrlHelper = require("../../../shared/utils/UrlHelper");
var _validations = require("../../../shared/validations");
var _context = require("../../context");
var _editor = require("../../editor");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _ImportTask = _interopRequireDefault(require("../../models/ImportTask"));
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _database = require("../../storage/database");
var _url = require("../../utils/url");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const PagePerImportTask = exports.PagePerImportTask = 3;
class ImportsProcessor extends _BaseProcessor.default {
  /**
   * Run the import processor.
   *
   * @param event The import event
   */
  async perform(event) {
    try {
      await _database.sequelize.transaction(async transaction => {
        const importModel = await _models.Import.findByPk(event.modelId, {
          rejectOnEmpty: true,
          paranoid: false,
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!this.canProcess(importModel) || importModel.state === _types.ImportState.Errored || importModel.state === _types.ImportState.Canceled) {
          return;
        }
        switch (event.name) {
          case "imports.create":
            return this.onCreation(importModel, transaction);
          case "imports.processed":
            return this.onProcessed(importModel, transaction);
          case "imports.delete":
            return this.onDeletion(importModel, event, transaction);
        }
      });
    } catch (err) {
      if (event.name !== "imports.delete" && err instanceof Error) {
        const importModel = await _models.Import.findByPk(event.modelId, {
          rejectOnEmpty: true,
          paranoid: false
        });
        importModel.error = (0, _compat.truncate)(err.message, {
          length: 255
        });
        await importModel.save();
      }
      throw err; // throw error for retry.
    }
  }
  async onFailed(event) {
    await _database.sequelize.transaction(async transaction => {
      const importModel = await _models.Import.findByPk(event.modelId, {
        rejectOnEmpty: true
      });
      importModel.state = _types.ImportState.Errored;
      await importModel.saveWithCtx((0, _context.createContext)({
        user: importModel.createdBy,
        transaction
      }));
    });
  }

  /**
   * Handle "imports.create" event.
   *
   * @param importModel Import model associated with the event.
   * @param transaction Sequelize transaction.
   * @returns Promise that resolves when the creation flow setup is done.
   */
  async onCreation(importModel, transaction) {
    if (!importModel.input.length) {
      return;
    }
    const tasksInput = await this.buildTasksInput(importModel, transaction);
    const phase = this.getInitialPhase();
    const importTasks = await Promise.all((0, _compat.chunk)(tasksInput, PagePerImportTask).map(input => {
      const attrs = {
        state: _types.ImportTaskState.Created,
        phase,
        input,
        importId: importModel.id
      };
      return _ImportTask.default.create(attrs, {
        transaction
      });
    }));
    importModel.state = _types.ImportState.InProgress;
    await importModel.save({
      transaction
    });
    if (importTasks.length > 0) {
      transaction.afterCommit(() => this.scheduleTask(importTasks[0]));
    }
  }

  /**
   * Handle "imports.processed" event.
   * This event is received when all the tasks for the import has been completed.
   * This method is responsible for persisting the collections and documents associated with the import.
   *
   * @param importModel Import model associated with the event.
   * @param transaction Sequelize transaction.
   * @returns Promise that resolves when mapping and persistence is completed.
   */
  async onProcessed(importModel, transaction) {
    try {
      const {
        collections
      } = await this.createCollectionsAndDocuments({
        importModel,
        transaction
      });

      // Once all collections and documents are created, update collection's document structure.
      // This ensures the root documents have the whole subtree available in the structure.
      for (const collection of collections) {
        await _models.Document.unscoped().findAllInBatches({
          where: {
            parentDocumentId: null,
            collectionId: collection.id
          },
          order: [["createdAt", "DESC"], ["id", "ASC"]],
          transaction
        }, async documents => {
          for (const document of documents) {
            await collection.addDocumentToStructure(document, undefined, {
              save: false,
              silent: true,
              transaction,
              insertOrder: "append"
            });
          }
        });
        await collection.save({
          silent: true,
          transaction
        });
      }
      importModel.state = _types.ImportState.Completed;
      importModel.error = null; // unset any error from previous attempts.
      await importModel.saveWithCtx((0, _context.createContext)({
        user: importModel.createdBy,
        transaction
      }));
    } catch (err) {
      if (err instanceof _sequelize.UniqueConstraintError) {
        _Logger.default.error("ImportsProcessor persistence failed due to unique constraint error", err, {
          fields: err.fields
        });
      }
      throw err;
    }
  }

  /**
   * Handle "imports.delete" event.
   * This method is responsible for deleting the collections and documents associated with the import.
   *
   * @param importModel Import model associated with the event.
   * @param event Received event.
   * @param transaction Sequelize transaction.
   * @returns Promise that resolves when the collections and documents are deleted.
   */
  async onDeletion(importModel, event, transaction) {
    if (importModel.state !== _types.ImportState.Completed) {
      return;
    }
    const user = await _models.User.findByPk(event.actorId, {
      rejectOnEmpty: true,
      paranoid: false,
      transaction
    });
    const collections = await _models.Collection.findAll({
      transaction,
      lock: transaction.LOCK.UPDATE,
      where: {
        teamId: importModel.teamId,
        apiImportId: importModel.id
      }
    });
    for (const collection of collections) {
      _Logger.default.debug("processor", "Destroying collection created from import", {
        collectionId: collection.id
      });
      await collection.destroyWithCtx((0, _context.createContext)({
        user,
        ip: event.ip,
        transaction
      }));
    }
  }

  /**
   * Create collections and documents associated with the import.
   *
   * @param importModel Import model associated with the event.
   * @param transaction Sequelize transaction.
   * @returns Promise of collection models that are created.
   */
  async createCollectionsAndDocuments(_ref) {
    let {
      importModel,
      transaction
    } = _ref;
    const now = new Date();
    const createdCollections = [];
    // External id to internal model id.
    const idMap = {};
    // Cache of resolved external author → internal user id (or undefined when
    // no match). Reused across every output in the import.
    const userIdCache = new Map();
    // These will be imported as collections. Widened to the base input shape
    // because the abstract class has no narrowed view of T.
    const importInput = (0, _compat.keyBy)(importModel.input, "externalId");
    const ctx = (0, _context.createContext)({
      user: importModel.createdBy,
      transaction
    });
    const firstCollection = await _models.Collection.findFirstCollectionForUser(importModel.createdBy, {
      attributes: ["index"],
      transaction
    });
    let collectionIdx = firstCollection?.index ?? null;

    // Pre-pass: allocate new urlIds for every collection and document in this
    // import so internal link hrefs in document content can be rewritten to
    // point at the new paths during persistence. The map is keyed by the old
    // urlId from the export, which is what appears in `/doc/<slug>-<urlId>`
    // and `/collection/<slug>-<urlId>` link hrefs.
    const urlIdMap = {};
    await _ImportTask.default.findAllInBatches({
      where: {
        importId: importModel.id
      },
      order: [["createdAt", "ASC"], ["id", "ASC"]],
      batchLimit: 5,
      transaction
    }, async importTasks => {
      for (const importTask of importTasks) {
        for (const output of importTask.output ?? []) {
          if (!output.urlId || urlIdMap[output.urlId]) {
            continue;
          }
          const isCollection = !!importInput[output.externalId];
          const allocated = isCollection ? await this.preserveCollectionUrlId(output.urlId, transaction) : await this.preserveDocumentUrlId(output.urlId, transaction);
          urlIdMap[output.urlId] = {
            urlId: allocated,
            title: output.title
          };
        }
      }
    });
    await _ImportTask.default.findAllInBatches({
      where: {
        importId: importModel.id
      },
      order: [["createdAt", "ASC"], ["id", "ASC"] // for stable order when multiple tasks have same "createdAt" value.
      ],
      // ordering ensures collections are created first.
      batchLimit: 5,
      // output data per task could be huge, keep a low batch size to prevent OOM.
      transaction
    }, async importTasks => {
      for (const importTask of importTasks) {
        const outputMap = (0, _compat.keyBy)(importTask.output ?? [], "externalId");
        for (const input of importTask.input) {
          const externalId = input.externalId;
          const internalId = await this.getInternalId(externalId, idMap);
          const parentExternalId = input.parentExternalId;
          const parentInternalId = parentExternalId ? await this.getInternalId(parentExternalId, idMap) : undefined;
          const collectionExternalId = input.collectionExternalId;
          const collectionInternalId = collectionExternalId ? await this.getInternalId(collectionExternalId, idMap) : undefined;
          const output = outputMap[externalId];

          // Skip this item if it has no output (likely due to an error during processing)
          if (!output) {
            _Logger.default.debug("processor", `Skipping item with no output: ${externalId}`);
            continue;
          }
          const collectionItem = importInput[externalId];
          const attachments = await _models.Attachment.findAll({
            attributes: ["id", "size"],
            where: {
              documentId: externalId
            },
            // This will be set for root pages too (which will be imported as collection)
            transaction
          });
          const transformedContent = await this.rewriteReferences({
            content: output.content,
            attachments,
            importInput,
            idMap,
            urlIdMap,
            actorId: importModel.createdById,
            teamId: importModel.teamId
          });
          const resolvedCreatedById = (await this.resolveExternalUserId(output, importModel.teamId, userIdCache, transaction)) ?? importModel.createdById;
          if (collectionItem) {
            // imported collection will be placed in the beginning.
            collectionIdx = (0, _fractionalIndex.default)(null, collectionIdx);
            const description = await _DocumentHelper.DocumentHelper.toMarkdown(transformedContent, {
              includeTitle: false
            });

            // Build sourceMetadata for the collection
            const sourceMetadata = {
              externalId: externalId,
              externalName: output.title,
              createdByName: output.author
            };
            const urlId = output.urlId ? urlIdMap[output.urlId]?.urlId : undefined;
            const collection = _models.Collection.build({
              id: internalId,
              urlId,
              name: output.title,
              icon: output.icon ?? "collection",
              color: output.color ?? (output.icon ? undefined : (0, _random.randomElement)(_collections.colorPalette)),
              content: transformedContent,
              description: (0, _compat.truncate)(description, {
                length: _validations.CollectionValidation.maxDescriptionLength
              }),
              createdById: resolvedCreatedById,
              teamId: importModel.createdBy.teamId,
              apiImportId: importModel.id,
              index: collectionIdx,
              sort: _models.Collection.DEFAULT_SORT,
              permission: collectionItem.permission,
              sourceMetadata,
              createdAt: output.createdAt ?? now,
              updatedAt: output.updatedAt ?? now
            });
            await collection.saveWithCtx(ctx, {
              silent: true
            }, {
              name: "create"
            });
            createdCollections.push(collection);

            // Unset documentId for attachments in collection overview.
            await _models.Attachment.update({
              documentId: null
            }, {
              where: {
                documentId: externalId
              },
              silent: true,
              transaction
            });
            continue;
          }

          // Document at the root of a collection when there's no parent (or) the parent is the collection.
          const isRootDocument = !parentExternalId || !!importInput[parentExternalId];
          const urlId = output.urlId ? urlIdMap[output.urlId]?.urlId : undefined;
          const defaults = {
            title: output.title,
            urlId,
            icon: output.icon,
            color: output.color,
            content: transformedContent,
            text: await _DocumentHelper.DocumentHelper.toMarkdown(transformedContent, {
              includeTitle: false
            }),
            collectionId: collectionInternalId,
            parentDocumentId: isRootDocument ? undefined : parentInternalId,
            createdById: resolvedCreatedById,
            lastModifiedById: resolvedCreatedById,
            teamId: importModel.createdBy.teamId,
            apiImportId: importModel.id,
            sourceMetadata: {
              externalId,
              externalName: output.title,
              createdByName: output.author
            },
            createdAt: output.createdAt ?? now,
            updatedAt: output.updatedAt ?? now,
            publishedAt: output.publishedAt ?? output.updatedAt ?? output.createdAt ?? now
          };
          try {
            await _models.Document.findOrCreateWithCtx(ctx, {
              where: {
                id: internalId
              },
              defaults,
              silent: true
            }, {
              name: "create",
              data: {
                title: output.title,
                source: "import"
              }
            });
          } catch (err) {
            if (err instanceof _sequelize.UniqueConstraintError) {
              _Logger.default.error(`ImportsProcessor document creation failed due to unique constraint error (${internalId}: ${defaults.title})`, err, {
                fields: err.fields,
                documentId: internalId,
                title: defaults.title,
                collectionId: defaults.collectionId,
                parentDocumentId: defaults.parentDocumentId
              });
            }
            throw err;
          }

          // Update document id for attachments in document content.
          await _models.Attachment.update({
            documentId: internalId
          }, {
            where: {
              documentId: externalId
            },
            silent: true,
            transaction
          });
        }
      }
    });
    return {
      collections: createdCollections
    };
  }

  /**
   * Rewrite the mentions, attachments, and internal document/collection link
   * marks in a ProseMirrorDoc so they resolve against the imported models
   * rather than the source export.
   *
   * @param content ProseMirrorDoc that represents collection (or) document content.
   * @param attachments Array of attachment models created for the import.
   * @param idMap Map of internalId to externalId.
   * @param urlIdMap Map of old urlId to the newly allocated urlId and title,
   *   used to rewrite `/doc/<slug>-<urlId>` and `/collection/<slug>-<urlId>`
   *   link hrefs.
   * @param importInput Contains the root externalId and associated info which were used to create the import.
   * @param actorId ID of the user who created the import.
   * @returns Updated ProseMirrorDoc.
   */
  async rewriteReferences(_ref2) {
    let {
      content,
      attachments,
      idMap,
      urlIdMap,
      importInput,
      actorId,
      teamId
    } = _ref2;
    // special case when the doc content is empty.
    if (!content.content.length) {
      return content;
    }
    const attachmentsMap = (0, _compat.keyBy)(attachments, "id");
    const doc = _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(content);
    const linkMarkType = _editor.schema.marks.link;
    const transformMentionNode = async node => {
      const json = node.toJSON();
      const attrs = json.attrs ?? {};
      attrs.id = (0, _nodeCrypto.randomUUID)();
      attrs.actorId = actorId;
      const externalId = attrs.modelId;
      attrs.modelId = await this.getInternalId(externalId, idMap, teamId);
      const isCollectionMention = !!importInput[externalId]; // the referenced externalId is a root page.
      attrs.type = isCollectionMention ? _types.MentionType.Collection : _types.MentionType.Document;
      json.attrs = attrs;
      return _prosemirrorModel.Node.fromJSON(_editor.schema, json);
    };
    const transformAttachmentNode = node => {
      const json = node.toJSON();
      const attrs = json.attrs ?? {};
      attrs.size = attachmentsMap[attrs.id]?.size;
      json.attrs = attrs;
      return _prosemirrorModel.Node.fromJSON(_editor.schema, json);
    };
    const rewriteInternalLinkHref = href => {
      const docMatch = /^\/doc\/([^/?#]+)(.*)$/.exec(href);
      if (docMatch) {
        const slugMatch = _UrlHelper.UrlHelper.SLUG_URL_REGEX.exec(docMatch[1]);
        const mapped = slugMatch ? urlIdMap[slugMatch[1]] : undefined;
        if (mapped) {
          return _models.Document.getPath({
            title: mapped.title,
            urlId: mapped.urlId
          }) + docMatch[2];
        }
      }
      const collectionMatch = /^\/collection\/([^/?#]+)(.*)$/.exec(href);
      if (collectionMatch) {
        const slugMatch = _UrlHelper.UrlHelper.SLUG_URL_REGEX.exec(collectionMatch[1]);
        const mapped = slugMatch ? urlIdMap[slugMatch[1]] : undefined;
        if (mapped) {
          return _models.Collection.getPath({
            name: mapped.title,
            urlId: mapped.urlId
          }) + collectionMatch[2];
        }
      }
      return href;
    };
    const transformLinkMarks = node => {
      if (!node.marks.length) {
        return node;
      }
      let changed = false;
      const newMarks = node.marks.map(mark => {
        if (mark.type !== linkMarkType) {
          return mark;
        }
        const href = mark.attrs.href;
        if (!href) {
          return mark;
        }
        const newHref = rewriteInternalLinkHref(href);
        if (newHref === href) {
          return mark;
        }
        changed = true;
        return linkMarkType.create({
          ...mark.attrs,
          href: newHref
        });
      });
      return changed ? node.mark(newMarks) : node;
    };
    const transformFragment = async fragment => {
      const nodePromises = [];
      fragment.forEach(node => {
        if (node.type.name === "mention") {
          nodePromises.push(transformMentionNode(node));
        } else if (node.type.name === "attachment") {
          nodePromises.push(Promise.resolve(transformAttachmentNode(node)));
        } else {
          nodePromises.push(transformFragment(node.content).then(transformedContent => transformLinkMarks(node.copy(transformedContent))));
        }
      });
      const nodes = await Promise.all(nodePromises);
      return _prosemirrorModel.Fragment.fromArray(nodes);
    };
    return doc.copy(await transformFragment(doc.content)).toJSON();
  }

  /**
   * Get internalId for the given externalId.
   * Returned internalId will be used as "id" for collections and documents created in the import.
   *
   * @param teamId teamId associated with the import.
   * @param externalId externalId from a source.
   * @param idMap Map of internalId to externalId.
   * @returns Mapped internalId.
   */
  async getInternalId(externalId, idMap, teamId) {
    let internalId = idMap[externalId];
    if (!internalId && teamId) {
      const existingId = (await _models.Document.findOne({
        attributes: ["id"],
        where: {
          teamId,
          sourceMetadata: {
            externalId
          }
        }
      }))?.id;
      if (existingId) {
        return existingId;
      }
    }
    idMap[externalId] = internalId ?? (0, _nodeCrypto.randomUUID)();
    return idMap[externalId];
  }

  /**
   * Resolves the original author of an imported item to a user in the target
   * team. Tries `createdById` first then falls back to `createdByEmail`; both
   * hits and misses are cached. Returns `undefined` when no match is found so
   * the caller can fall back to the importing user.
   *
   * @param output The ImportTaskOutput entry carrying optional original-author
   *               fields from the source.
   * @param teamId Team to scope the lookup to.
   * @param cache Map reused across calls within one persistence pass.
   * @param transaction Active sequelize transaction.
   * @returns The matched internal user id, or undefined.
   */
  async resolveExternalUserId(output, teamId, cache, transaction) {
    if (output.createdById) {
      const cacheKey = `id:${output.createdById}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const user = await _models.User.findOne({
        where: {
          id: output.createdById,
          teamId
        },
        transaction
      });
      if (user) {
        cache.set(cacheKey, user.id);
        return user.id;
      }
      cache.set(cacheKey, undefined);
    }
    if (output.createdByEmail) {
      const email = output.createdByEmail.toLowerCase().trim();
      const cacheKey = `email:${email}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const user = await _models.User.findOne({
        where: {
          email,
          teamId
        },
        transaction
      });
      if (user) {
        cache.set(cacheKey, user.id);
        if (output.createdById) {
          cache.set(`id:${output.createdById}`, user.id);
        }
        return user.id;
      }
      cache.set(cacheKey, undefined);
    }
    return undefined;
  }

  /**
   * Honors a urlId from a document export if it does not collide with an
   * existing Document, otherwise generates a fresh one.
   *
   * @param sourceUrlId The urlId requested by the importer.
   * @param transaction Active sequelize transaction.
   * @returns A urlId to use.
   */
  async preserveDocumentUrlId(sourceUrlId, transaction) {
    const existing = await _models.Document.unscoped().findOne({
      attributes: ["id"],
      paranoid: false,
      where: {
        urlId: sourceUrlId
      },
      transaction
    });
    return existing ? (0, _url.generateUrlId)() : sourceUrlId;
  }

  /**
   * Honors a urlId from a collection export if it does not collide with an
   * existing Collection, otherwise generates a fresh one.
   *
   * @param sourceUrlId The urlId requested by the importer.
   * @param transaction Active sequelize transaction.
   * @returns A urlId to use.
   */
  async preserveCollectionUrlId(sourceUrlId, transaction) {
    const existing = await _models.Collection.unscoped().findOne({
      attributes: ["id"],
      paranoid: false,
      where: {
        urlId: sourceUrlId
      },
      transaction
    });
    return existing ? (0, _url.generateUrlId)() : sourceUrlId;
  }

  /**
   * Determine whether this import can be processed by this processor.
   *
   * @param importModel Import model associated with the import.
   * @returns boolean.
   */

  /**
   * Phase assigned to the initial ImportTask rows created from
   * `buildTasksInput`. Sources that begin with a bootstrap step (e.g.
   * Markdown zip extraction) override this to return `Bootstrap`. Sources
   * that fan out directly into page work (e.g. Notion) leave the default.
   *
   * @returns Phase for the first wave of ImportTask rows.
   */
  getInitialPhase() {
    return _types.ImportTaskPhase.Page;
  }

  /**
   * Build task inputs which will be used for `APIImportTask`s.
   *
   * @param importInput Array of root externalId and associated info which were used to create the import.
   * @returns `ImportTaskInput`.
   */

  /**
   * Schedule the first `APIImportTask` for the import.
   *
   * @param importTask ImportTask model associated with the `APIImportTask`.
   * @returns Promise that resolves when the task is scheduled.
   */
}
exports.default = ImportsProcessor;
_defineProperty(ImportsProcessor, "applicableEvents", ["imports.create", "imports.processed", "imports.delete"]);