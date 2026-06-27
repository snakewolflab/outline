"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.rewriteAttachmentReferences = rewriteAttachmentReferences;
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = require("node:crypto");
var _prosemirrorModel = require("prosemirror-model");
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _context = require("../../context");
var _editor = require("../../editor");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _AttachmentHelper = _interopRequireDefault(require("../../models/helpers/AttachmentHelper"));
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _database = require("../../storage/database");
var _files = _interopRequireDefault(require("../../storage/files"));
var _ZipHelper = _interopRequireDefault(require("../../utils/ZipHelper"));
var _APIImportTask = _interopRequireDefault(require("./APIImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const REDIRECT_URL_REGEX = /\/api\/attachments\.redirect\?id=([^&"'\s)]+)/g;
const ATTACHMENT_NODE_TYPES = ["attachment", "image", "video"];
/**
 * Rewrites `/api/attachments.redirect?id=<externalId>` references in a
 * ProseMirror document to point at the corresponding new attachment ids.
 * Operates on both `href` (attachment nodes) and `src` (image / video nodes).
 * Also updates the `id` attribute on attachment nodes so it lines up with the
 * created Attachment row. Unknown ids are left intact so a malformed export
 * cannot crash the importer.
 *
 * Exported for tests; not part of the module's public surface.
 *
 * @param content ProseMirror content from a document or collection.
 * @param attachmentIdMap Map of external attachment id → new internal id.
 * @returns ProseMirror content with rewritten attachment references.
 */
function rewriteAttachmentReferences(content, attachmentIdMap) {
  const rewriteUrl = url => {
    if (!url) {
      return url;
    }
    return url.replace(REDIRECT_URL_REGEX, (full, externalId) => {
      const newId = attachmentIdMap[externalId];
      return newId ? _models.Attachment.getRedirectUrl(newId) : full;
    });
  };
  const transformAttachmentNode = node => {
    const json = node.toJSON();
    const attrs = {
      ...(json.attrs ?? {})
    };
    if (node.type.name === "attachment") {
      const href = attrs.href;
      attrs.href = rewriteUrl(href);

      // Keep `id` aligned with the rewritten URL so downstream consumers that
      // read the attachment id (e.g. size hydration in ImportsProcessor) can
      // resolve it via the new Attachment row.
      if (typeof attrs.id === "string" && attachmentIdMap[attrs.id]) {
        attrs.id = attachmentIdMap[attrs.id];
      } else if (typeof href === "string") {
        const match = /\/api\/attachments\.redirect\?id=([^&"'\s)]+)/.exec(href);
        if (match && attachmentIdMap[match[1]]) {
          attrs.id = attachmentIdMap[match[1]];
        }
      }
    } else if (node.type.name === "image" || node.type.name === "video") {
      attrs.src = rewriteUrl(attrs.src);
    }
    json.attrs = attrs;
    return _prosemirrorModel.Node.fromJSON(_editor.schema, json);
  };
  const transformFragment = fragment => {
    const nodes = [];
    fragment.forEach(node => {
      nodes.push(ATTACHMENT_NODE_TYPES.includes(node.type.name) ? transformAttachmentNode(node) : node.copy(transformFragment(node.content)));
    });
    return _prosemirrorModel.Fragment.fromArray(nodes);
  };
  const doc = _prosemirrorModel.Node.fromJSON(_editor.schema, content);
  return doc.copy(transformFragment(doc.content)).toJSON();
}
class JSONAPIImportTask extends _APIImportTask.default {
  shouldUploadAttachmentsPerPage() {
    return false;
  }
  async scheduleNextTask(importTask) {
    await new JSONAPIImportTask().schedule({
      importTaskId: importTask.id
    });
  }
  async onAllTasksCompleted(lastImportTask) {
    const scratch = lastImportTask.import.scratch;
    if (!scratch?.storageKey || !scratch.manifest?.length) {
      return;
    }
    const handle = await _files.default.getFileHandle(scratch.storageKey);
    try {
      const createdBy = lastImportTask.import.createdBy;
      const manifestByPath = new Map(scratch.manifest.map(item => [item.pathInZip, item]));
      const maxAttachmentSize = _AttachmentHelper.default.presetToMaxUploadSize(_types.AttachmentPreset.DocumentAttachment);
      const seen = new Set();
      await _ZipHelper.default.walk(handle.path, async entry => {
        if (entry.isDirectory) {
          return;
        }
        // Normalize to match the bootstrap-phase pathInZip (segments rejoined
        // with `/`, no leading `./` or empty segments).
        const normalized = entry.fileName.split("/").filter(s => s !== "" && s !== ".").join("/");
        const item = manifestByPath.get(normalized);
        if (!item) {
          return;
        }
        seen.add(item.pathInZip);
        const buffer = await entry.readBuffer(maxAttachmentSize);
        try {
          await _database.sequelize.transaction(async transaction => (0, _attachmentCreator.default)({
            source: "import",
            preset: _types.AttachmentPreset.DocumentAttachment,
            id: item.id,
            name: item.name,
            type: item.mimeType,
            buffer,
            user: createdBy,
            ctx: (0, _context.createContext)({
              user: createdBy,
              transaction
            }),
            fetchOptions: {
              timeout: _env.default.FILE_STORAGE_IMPORT_TIMEOUT
            }
          }));
        } catch (err) {
          // Each attachment commits in its own transaction, so a retry of
          // this hook can re-encounter ids that already landed. Treat the
          // unique-id collision as a no-op so the import remains resumable.
          if (err instanceof _sequelize.UniqueConstraintError) {
            return;
          }
          throw err;
        }
      });
      for (const item of scratch.manifest) {
        if (!seen.has(item.pathInZip)) {
          _Logger.default.warn(`JSON import attachment missing in zip, skipping: ${item.pathInZip}`);
        }
      }
    } finally {
      await handle.cleanup().catch(() => {});
    }
  }
  async processBootstrap(importTask) {
    const storageKey = importTask.import.scratch?.storageKey;
    if (!storageKey) {
      throw new Error("JSON import is missing scratch.storageKey");
    }
    const handle = await _files.default.getFileHandle(storageKey);
    try {
      // Pre-load every JSON file at the top level of the zip during the walk.
      // ZipHelper streams the archive end-to-end; capturing here means we can
      // pair tree nodes with their parsed content without re-opening the zip.
      const jsonByPath = new Map();
      const maxJSONSize = _AttachmentHelper.default.presetToMaxUploadSize(_types.AttachmentPreset.WorkspaceImport);
      const tree = await _ZipHelper.default.toFileTree(handle.path, async (node, entry) => {
        if (_nodePath.default.extname(node.name).toLowerCase() !== ".json") {
          return;
        }
        const buffer = await entry.readBuffer(maxJSONSize);
        try {
          jsonByPath.set(node.pathInZip, JSON.parse(buffer.toString("utf8")));
        } catch (err) {
          throw new Error(`Could not parse ${node.name}. ${err instanceof Error ? err.message : "unknown error"}`);
        }
      });
      if (tree.children.length === 0) {
        throw new Error("Could not find valid content in zip file");
      }
      const metadata = jsonByPath.get("metadata.json");
      _Logger.default.debug("task", "Importing JSON metadata", {
        metadata
      });
      const manifest = [];
      // External attachment id → manifest entry id (the new Attachment.id).
      const attachmentIdMap = {};
      const collectionExports = [];
      for (const node of tree.children) {
        if (node.children.length > 0 || node.name === "metadata.json") {
          continue;
        }
        if (_nodePath.default.extname(node.name).toLowerCase() !== ".json") {
          _Logger.default.debug("task", `Unhandled file in zip: ${node.pathInZip}`, {
            importTaskId: importTask.id
          });
          continue;
        }
        const parsed = jsonByPath.get(node.pathInZip);
        if (!parsed) {
          continue;
        }
        const collectionExternalId = parsed.collection.id;
        collectionExports.push({
          externalId: collectionExternalId,
          data: parsed
        });
        for (const attachment of Object.values(parsed.attachments ?? {})) {
          this.registerAttachment(attachment, manifest, attachmentIdMap);
        }
      }

      // Discover documents per collection, building the parent/child tree
      // shape expected by the per-page cascade.
      const collections = collectionExports.map(c => this.buildCollection(c.externalId, c.data));

      // Replace anything past the create-time placeholder with the freshly
      // discovered collections so a retried bootstrap doesn't accumulate
      // duplicate entries.
      const associatedImport = importTask.import;
      const placeholder = associatedImport.input[0];
      associatedImport.input = [placeholder, ...collections.map(c => ({
        externalId: c.externalId,
        permission: placeholder.permission
      }))];
      associatedImport.scratch = {
        storageKey,
        manifest
      };
      await associatedImport.save();

      // Collection placeholder items so ImportsProcessor iterates them
      // during the bootstrap row (the earliest createdAt) — that guarantees
      // collections land in the DB before any per-page document references
      // them.
      importTask.input = [importTask.input[0], ...collections.map(c => ({
        externalId: c.externalId,
        title: c.export.name,
        urlId: c.export.urlId,
        icon: c.export.icon,
        color: c.export.color,
        data: c.export.data ?? _ProsemirrorHelper.ProsemirrorHelper.getEmptyDocument(),
        attachmentIdMap
      }))];
      const collectionOutputs = collections.map(c => ({
        externalId: c.externalId,
        title: c.export.name,
        urlId: c.export.urlId,
        icon: c.export.icon,
        color: c.export.color,
        content: rewriteAttachmentReferences(c.export.data ?? _ProsemirrorHelper.ProsemirrorHelper.getEmptyDocument(), attachmentIdMap)
      }));

      // First wave of document tasks: only top-level docs in each collection.
      // Each carries its descendants in `children` and the per-page handler
      // re-emits them as the next wave of childTasksInput, producing a strict
      // depth-ordered cascade of ImportTask rows so parent FKs are always
      // satisfied at child-doc creation time.
      const childTasksInput = collections.flatMap(c => c.children.map(d => this.toPageInput(d, attachmentIdMap)));
      return {
        taskOutput: collectionOutputs,
        childTasksInput
      };
    } finally {
      await handle.cleanup().catch(() => {});
    }
  }
  async processPage(importTask) {
    const taskOutput = [];
    const childTasksInput = [];
    const items = importTask.input;
    for (const item of items) {
      const transformed = rewriteAttachmentReferences(item.data, item.attachmentIdMap);
      taskOutput.push({
        externalId: item.externalId,
        title: item.title,
        urlId: item.urlId,
        icon: item.icon,
        color: item.color,
        author: item.createdByName,
        createdById: item.createdById,
        createdByEmail: item.createdByEmail,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        content: transformed
      });
      if (item.children?.length) {
        childTasksInput.push(...item.children);
      }
    }
    return {
      taskOutput,
      childTasksInput
    };
  }

  /**
   * Discovers documents in a parsed CollectionJSONExport, recursively packing
   * each parent's direct descendants into `children`. Falls back to the
   * export's `documentStructure` when present (preserves authored order) and
   * otherwise walks the `documents` map.
   *
   * @param externalId The collection's external id.
   * @param data Parsed CollectionJSONExport.
   * @returns A collection record with a tree of `DiscoveredDocument`s.
   */
  buildCollection(externalId, data) {
    const docMap = data.documents ?? {};
    const makeNode = (doc, parentExternalId) => ({
      externalId: doc.id,
      parentExternalId: parentExternalId ?? doc.parentDocumentId ?? undefined,
      collectionExternalId: externalId,
      export: doc,
      children: []
    });

    // Prefer the authored `documentStructure` if available — it preserves
    // sibling order; otherwise fall back to parent/child links.
    const roots = [];
    if (data.collection.documentStructure?.length) {
      const walk = (navNodes, parentExternalId, out) => {
        for (const nav of navNodes) {
          const doc = docMap[nav.id];
          if (!doc) {
            continue;
          }
          const node = makeNode(doc, parentExternalId);
          out.push(node);
          if (nav.children?.length) {
            walk(nav.children, doc.id, node.children);
          }
        }
      };
      walk(data.collection.documentStructure, undefined, roots);
    } else {
      const byParent = new Map();
      for (const doc of Object.values(docMap)) {
        const parent = doc.parentDocumentId ?? undefined;
        const bucket = byParent.get(parent) ?? [];
        bucket.push(doc);
        byParent.set(parent, bucket);
      }
      const walk = (parentExternalId, out) => {
        const docs = byParent.get(parentExternalId) ?? [];
        for (const doc of docs) {
          const node = makeNode(doc, parentExternalId);
          out.push(node);
          walk(doc.id, node.children);
        }
      };
      walk(undefined, roots);
    }
    return {
      externalId,
      export: data.collection,
      children: roots
    };
  }

  /**
   * Records an attachment in the manifest and the external→new id map. Skips
   * duplicates so collections that share an attachment id (unlikely in a
   * valid export, but possible) only land once.
   *
   * @param attachment The attachment as it appears in the export.
   * @param manifest Manifest array to push entries into.
   * @param attachmentIdMap External id → new internal id map.
   */
  registerAttachment(attachment, manifest, attachmentIdMap) {
    if (attachmentIdMap[attachment.id]) {
      return;
    }
    if (attachment.key.includes("..")) {
      throw new Error(`Invalid attachment path: ${attachment.key}`);
    }
    const id = (0, _nodeCrypto.randomUUID)();
    attachmentIdMap[attachment.id] = id;
    manifest.push({
      id,
      externalId: attachment.id,
      name: attachment.name,
      mimeType: attachment.contentType || "application/octet-stream",
      pathInZip: attachment.key
    });
  }

  /**
   * Converts a discovered document subtree into a per-page task input,
   * recursively packing the doc's descendants into the `children` field so
   * each tree-depth runs as its own task wave.
   *
   * @param doc The discovered document, including its descendants.
   * @param attachmentIdMap External attachment id → new internal id map.
   * @returns A self-contained per-page task input.
   */
  toPageInput(doc, attachmentIdMap) {
    const exported = doc.export;
    return {
      externalId: doc.externalId,
      parentExternalId: doc.parentExternalId,
      collectionExternalId: doc.collectionExternalId,
      title: exported.title,
      urlId: exported.urlId,
      icon: exported.icon ?? exported.emoji,
      color: exported.color,
      data: exported.data,
      createdById: exported.createdById,
      createdByName: exported.createdByName,
      createdByEmail: exported.createdByEmail,
      createdAt: exported.createdAt,
      updatedAt: exported.updatedAt,
      publishedAt: exported.publishedAt,
      attachmentIdMap,
      children: doc.children.length ? doc.children.map(c => this.toPageInput(c, attachmentIdMap)) : undefined
    };
  }
}
exports.default = JSONAPIImportTask;