"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.rewriteAttachmentPaths = rewriteAttachmentPaths;
exports.rewriteInternalLinks = rewriteInternalLinks;
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = require("node:crypto");
var _compat = require("es-toolkit/compat");
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _sequelize = require("sequelize");
var _validations = require("../../../shared/validations");
var _types = require("../../../shared/types");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _context = require("../../context");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _AttachmentHelper = _interopRequireWildcard(require("../../models/helpers/AttachmentHelper"));
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _database = require("../../storage/database");
var _files = _interopRequireDefault(require("../../storage/files"));
var _ZipHelper = _interopRequireDefault(require("../../utils/ZipHelper"));
var _APIImportTask = _interopRequireDefault(require("./APIImportTask"));
var _DocumentConverter = require("../../utils/DocumentConverter");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Rewrites local attachment paths in markdown text into `<<attachmentId>>`
 * placeholders. Supports legacy bucket layouts (`uploads/`, `public/`),
 * arbitrary nested folder names, and `./attachments/...` rooted paths. Both
 * encoded and unencoded path forms are matched.
 *
 * Exported for tests; not part of the module's public surface.
 *
 * @param markdown The raw markdown text from a single document.
 * @param attachments Attachment manifest entries to substitute.
 * @returns Markdown text with local paths replaced by `<<id>>` references.
 */
function rewriteAttachmentPaths(markdown, attachments) {
  let text = markdown;
  for (const attachment of attachments) {
    const encodedPath = encodeURI(attachment.pathInZip);
    const attachmentFileName = _nodePath.default.basename(attachment.pathInZip);
    const reference = `<<${attachment.id}>>`;
    const normalizedAttachmentPath = encodedPath.replace(new RegExp(`(.*)/${_AttachmentHelper.Buckets.uploads}/`), `${_AttachmentHelper.Buckets.uploads}/`).replace(new RegExp(`(.*)/${_AttachmentHelper.Buckets.public}/`), `${_AttachmentHelper.Buckets.public}/`);
    const attachmentDir = _nodePath.default.basename(_nodePath.default.dirname(attachment.pathInZip));
    const genericNormalizedPath = `${attachmentDir}/${encodeURI(attachmentFileName)}`;
    text = text.replace(new RegExp((0, _compat.escapeRegExp)(encodedPath), "g"), reference).replace(new RegExp(`\\.?/?${(0, _compat.escapeRegExp)(normalizedAttachmentPath)}`, "g"), reference);
    const segments = attachment.pathInZip.split(_nodePath.default.sep);
    const attachmentsIdx = segments.findIndex(seg => seg.toLowerCase() === "attachments");
    if (attachmentsIdx >= 0) {
      const relFromAttachments = segments.slice(attachmentsIdx).join("/");
      text = text.replace(new RegExp(`\\.?/?${(0, _compat.escapeRegExp)(encodeURI(relFromAttachments))}`, "g"), reference);
    }
    text = text.replace(new RegExp(`\\.?/?${(0, _compat.escapeRegExp)(genericNormalizedPath)}`, "g"), reference);
  }
  return text;
}

/**
 * Rewrites internal markdown links (`[label](./relative.md)`) into
 * `<<documentId>>` placeholders, resolved against a path → id map built from
 * the zip's full document tree.
 *
 * Exported for tests; not part of the module's public surface.
 *
 * @param markdown The raw markdown text from a single document.
 * @param documentPath Zip-relative path of the document being rewritten
 *                     (e.g. `Collection/parent.md`); used as the base for
 *                     resolving relative link targets against docMap keys.
 * @param docMap Map of document path (as it appeared in the zip) to its
 *               pre-assigned externalId.
 * @returns Markdown text with internal `.md` link targets replaced by
 *          `<<id>>` references.
 */
function rewriteInternalLinks(markdown, documentPath, docMap) {
  const basePath = _nodePath.default.dirname(documentPath);
  const internalLinks = [...markdown.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)];
  let text = markdown;
  for (const match of internalLinks) {
    const referredDocPath = match[1];
    const normalizedDocPath = decodeURI(_nodePath.default.normalize(`${basePath}/${referredDocPath}`));
    const referredDocId = docMap[normalizedDocPath];
    if (referredDocId) {
      text = text.replace(referredDocPath, `<<${referredDocId}>>`);
    }
  }
  return text;
}
class MarkdownAPIImportTask extends _APIImportTask.default {
  shouldUploadAttachmentsPerPage() {
    return false;
  }
  async scheduleNextTask(importTask) {
    await new MarkdownAPIImportTask().schedule({
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
        const normalized = entry.fileName.split("/").filter(Boolean).join("/");
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
          _Logger.default.warn(`Markdown import attachment missing in zip, skipping: ${item.pathInZip}`);
        }
      }
    } finally {
      await handle.cleanup().catch(() => {});
    }
  }
  async processBootstrap(importTask) {
    const storageKey = importTask.import.scratch?.storageKey;
    if (!storageKey) {
      throw new Error("Markdown import is missing scratch.storageKey");
    }
    const handle = await _files.default.getFileHandle(storageKey);
    try {
      // Side map of pre-loaded markdown text keyed by tree node identity.
      // ZipHelper's tree carries only metadata; we capture text during the
      // single walk so the downstream pass doesn't have to re-open the zip.
      const markdownByNode = new Map();
      const tree = await _ZipHelper.default.toFileTree(handle.path, async (node, entry) => {
        const ext = _nodePath.default.extname(node.name).toLowerCase();
        if (ext === ".md" || ext === ".markdown") {
          const buffer = await entry.readBuffer(_validations.DocumentValidation.maxStateLength);
          markdownByNode.set(node, buffer.toString("utf8"));
        }
      });
      if (tree.children.length === 0) {
        throw new Error("Could not find valid content in zip file");
      }
      const collections = [];
      const manifest = [];
      for (const node of tree.children) {
        if (node.children.length === 0) {
          _Logger.default.debug("task", `Unhandled file in zip: ${node.pathInZip}`, {
            importTaskId: importTask.id
          });
          continue;
        }
        if (this.isAttachmentFolder(node)) {
          this.collectAttachments(node, manifest);
          continue;
        }
        const collection = {
          id: (0, _nodeCrypto.randomUUID)(),
          title: node.title,
          children: []
        };
        collections.push(collection);
        this.collectDocumentsAndAttachments({
          children: node.children,
          collectionId: collection.id,
          out: collection.children,
          manifest,
          markdownByNode
        });
      }

      // Build docMap (pathInZip -> externalId) for internal-link resolution.
      // Walk the full document tree to collect every doc id, since internal
      // markdown links can target any document regardless of depth.
      const docMap = {};
      const collectDocMap = docs => {
        for (const d of docs) {
          docMap[d.pathInZip] = d.id;
          collectDocMap(d.children);
        }
      };
      for (const c of collections) {
        collectDocMap(c.children);
      }

      // Replace (not append) anything past the create-time placeholder with
      // the freshly discovered collections so a retried bootstrap doesn't
      // accumulate duplicate entries with fresh UUIDs from a previous
      // partial run. ImportsProcessor's persistence pass treats these as
      // collections.
      const associatedImport = importTask.import;
      const placeholder = associatedImport.input[0];
      associatedImport.input = [placeholder, ...collections.map(c => ({
        externalId: c.id,
        permission: placeholder.permission
      }))];
      associatedImport.scratch = {
        storageKey,
        manifest
      };
      await associatedImport.save();

      // Append collection placeholder items so ImportsProcessor iterates
      // them during the bootstrap row (the earliest createdAt) — that
      // guarantees collections land in the DB before any per-page document
      // references them.
      const collectionInputItems = collections.map(c => ({
        externalId: c.id,
        title: c.title,
        path: c.title,
        markdownText: "",
        attachmentMap: [],
        docMap: {}
      }));
      importTask.input = [importTask.input[0], ...collectionInputItems];
      const collectionOutputs = collections.map(c => ({
        externalId: c.id,
        title: c.title,
        content: _ProsemirrorHelper.ProsemirrorHelper.getEmptyDocument()
      }));

      // First wave of document tasks: only top-level docs in each collection.
      // Each carries its descendants in `children` and the per-page handler
      // re-emits them as the next wave of childTasksInput, producing a strict
      // depth-ordered cascade of ImportTask rows so parent FKs are always
      // satisfied at child-doc creation time.
      const childTasksInput = collections.flatMap(c => c.children.map(d => this.toPageInput(d, manifest, docMap)));
      return {
        taskOutput: collectionOutputs,
        childTasksInput
      };
    } finally {
      await handle.cleanup().catch(() => {});
    }
  }

  /**
   * Converts a discovered document subtree into a per-page task input,
   * recursively packing the doc's descendants into the `children` field so
   * each tree-depth runs as its own task wave.
   *
   * @param doc The discovered document, including its descendants.
   * @param manifest The full attachment manifest (used for per-page refs).
   * @param docMap Path → externalId map for internal link rewriting.
   * @returns A self-contained per-page task input.
   */
  toPageInput(doc, manifest, docMap) {
    return {
      externalId: doc.id,
      parentExternalId: doc.parentDocumentId,
      collectionExternalId: doc.collectionId,
      title: doc.title,
      path: doc.pathInZip,
      markdownText: doc.markdownText,
      attachmentMap: this.attachmentsReferencedBy(doc.markdownText, manifest),
      docMap,
      children: doc.children.length ? doc.children.map(c => this.toPageInput(c, manifest, docMap)) : undefined
    };
  }
  async processPage(importTask) {
    const taskOutput = [];
    const childTasksInput = [];
    const items = importTask.input;
    for (const item of items) {
      // Empty markdown short-circuits — used by collection placeholders so
      // ImportsProcessor sees their externalId paired with empty content and
      // builds a Collection rather than a Document. (Currently collections
      // are persisted via the bootstrap task itself, so this branch is only
      // a defensive fallback.)
      if (!item.markdownText) {
        taskOutput.push({
          externalId: item.externalId,
          title: item.title,
          content: _ProsemirrorHelper.ProsemirrorHelper.getEmptyDocument()
        });
      } else {
        const transformedMarkdown = this.rewriteMarkdown(item);
        const {
          doc,
          title,
          icon
        } = await _DocumentConverter.DocumentConverter.convert(transformedMarkdown, _nodePath.default.basename(item.path), "text/markdown");
        taskOutput.push({
          externalId: item.externalId,
          title: title || item.title,
          icon,
          content: doc.toJSON()
        });
      }

      // Cascade this doc's direct descendants as the next task wave. Their
      // ImportTask rows will be created after the current one returns, so
      // their createdAt is strictly later — guaranteeing parent-before-child
      // FK ordering during ImportsProcessor's persistence pass.
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
   * Pre-rewrites a page's markdown text. Internal `.md` links become mention
   * markdown so the editor parses them as Document mentions. Attachment paths
   * are first reduced to `<<id>>` placeholders by the shared rewriter, then
   * — distinct from the prosemirror-tree walk we used to do — substituted
   * with their final attachment redirect URLs in the markdown text. Doing
   * the resolution at the text layer avoids markdown-it parsing `<<id>>` as
   * an angle-bracket-wrapped URL (which produced broken image src attrs).
   *
   * @param page The per-page task input.
   * @returns Rewritten markdown text ready for DocumentConverter.
   */
  rewriteMarkdown(page) {
    let text = rewriteInternalLinks(page.markdownText, page.path, page.docMap);

    // Convert `[label](<<id>>)` links from rewriteInternalLinks into mention
    // markdown the editor recognises: `@[label](mention://<uuid>/document/<id>)`.
    text = text.replace(/\[([^\]]+)\]\(<<([^>]+)>>\)/g, (_full, label, externalId) => `@[${label}](mention://${(0, _nodeCrypto.randomUUID)()}/document/${externalId})`);
    text = rewriteAttachmentPaths(text, page.attachmentMap.map(m => ({
      id: m.id,
      pathInZip: m.pathInZip
    })));

    // Resolve remaining `<<id>>` placeholders to attachment redirect URLs.
    text = text.replace(/<<([^>]+)>>/g, (_full, id) => _models.Attachment.getRedirectUrl(id));
    return text;
  }

  /**
   * Returns the subset of the full manifest that is referenced anywhere in
   * the given markdown text. Used to bound the per-page task input size.
   *
   * @param markdown Raw markdown text for a single document.
   * @param manifest The full attachment manifest from the bootstrap phase.
   * @returns Manifest entries that appear (by filename) in the markdown.
   */
  attachmentsReferencedBy(markdown, manifest) {
    return manifest.filter(item => {
      const fileName = _nodePath.default.basename(item.pathInZip);
      return markdown.includes(fileName) || markdown.includes(encodeURI(fileName));
    });
  }

  /**
   * Detects folders containing only attachments (no markdown documents).
   * Recursively considers nested folders; mirrors the legacy heuristic.
   *
   * @param node ZipTreeNode to inspect.
   * @returns true when the folder appears to hold only attachments.
   */
  isAttachmentFolder(node) {
    if (node.children.length === 0) {
      return false;
    }
    if (node.title.toLowerCase() === "attachments") {
      return true;
    }
    return node.children.every(child => {
      if (child.children.length > 0) {
        return this.isAttachmentFolder(child);
      }
      const ext = _nodePath.default.extname(child.name).toLowerCase();
      if (!ext) {
        return false;
      }
      return ext !== ".md" && ext !== ".markdown";
    });
  }

  /**
   * Recursively collects all files under an attachment-only folder into the
   * manifest. `pathInZip` is stored verbatim so the completion phase can find
   * the same entry when re-walking the archive.
   *
   * @param node Attachment-folder ZipTreeNode.
   * @param manifest Manifest array to push entries into.
   */
  collectAttachments(node, manifest) {
    for (const child of node.children) {
      if (child.children.length > 0) {
        this.collectAttachments(child, manifest);
        continue;
      }
      manifest.push({
        id: (0, _nodeCrypto.randomUUID)(),
        name: child.name,
        pathInZip: child.pathInZip,
        mimeType: _mimeTypes.default.lookup(child.name) || "application/octet-stream"
      });
    }
  }

  /**
   * Walks a collection subtree and gathers documents (markdown files) and
   * loose attachments. Documents are appended to `out` as a tree — each
   * entry's `children` holds its direct descendants. This is the shape the
   * per-page task cascade consumes.
   *
   * @param children ZipTreeNode children of the current folder.
   * @param collectionId Pre-assigned id of the enclosing collection.
   * @param parentDocumentId Optional parent document id when nested.
   * @param out Sibling accumulator to push discovered documents into.
   * @param manifest Attachment manifest accumulator.
   * @param markdownByNode Pre-loaded markdown text keyed by tree node.
   */
  collectDocumentsAndAttachments(_ref) {
    let {
      children,
      collectionId,
      parentDocumentId,
      out,
      manifest,
      markdownByNode
    } = _ref;
    for (const child of children) {
      if (child.children.length > 0 && this.isAttachmentFolder(child)) {
        this.collectAttachments(child, manifest);
        continue;
      }
      const ext = _nodePath.default.extname(child.name).toLowerCase();
      const isMarkdown = ext === ".md" || ext === ".markdown";
      const isFolder = child.children.length > 0;
      if (!isMarkdown && !isFolder) {
        manifest.push({
          id: (0, _nodeCrypto.randomUUID)(),
          name: child.name,
          pathInZip: child.pathInZip,
          mimeType: _mimeTypes.default.lookup(child.name) || "application/octet-stream"
        });
        continue;
      }
      const id = (0, _nodeCrypto.randomUUID)();
      const markdownText = isFolder ? "" : markdownByNode.get(child) ?? "";

      // Folder-and-file with the same title (a "name.md" alongside a "name/"
      // directory) is merged onto a single document: the folder body picks up
      // the file's markdown text, and the folder's contents become children.
      const sibling = out.find(d => d.title === child.title);
      if (sibling) {
        if (sibling.markdownText === "" && markdownText) {
          sibling.markdownText = markdownText;
        }
        if (isFolder) {
          this.collectDocumentsAndAttachments({
            children: child.children,
            collectionId,
            parentDocumentId: sibling.id,
            out: sibling.children,
            manifest,
            markdownByNode
          });
        }
        continue;
      }
      const node = {
        id,
        title: child.title,
        pathInZip: child.pathInZip,
        collectionId,
        parentDocumentId,
        markdownText,
        children: []
      };
      out.push(node);
      if (isFolder) {
        this.collectDocumentsAndAttachments({
          children: child.children,
          collectionId,
          parentDocumentId: id,
          out: node.children,
          manifest,
          markdownByNode
        });
      }
    }
  }
}
exports.default = MarkdownAPIImportTask;