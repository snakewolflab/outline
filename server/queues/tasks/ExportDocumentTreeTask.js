"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _compat = require("es-toolkit/compat");
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _Attachment = _interopRequireDefault(require("../../models/Attachment"));
var _Document = _interopRequireDefault(require("../../models/Document"));
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _ZipHelper = _interopRequireDefault(require("../../utils/ZipHelper"));
var _fs = require("../../utils/fs");
var _ExportTask = _interopRequireDefault(require("./ExportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportDocumentTreeTask extends _ExportTask.default {
  /**
   * Exports the document tree to the given zip instance.
   *
   * @param zip The yazl ZipFile to add files to
   * @param documentId The document ID to export
   * @param pathInZip The path in the zip to add the document to
   * @param format The format to export in
   */
  async processDocument(_ref) {
    let {
      zip,
      pathInZip,
      documentId,
      format,
      includeAttachments,
      pathMap
    } = _ref;
    _Logger.default.debug("task", `Adding document to archive`, {
      documentId
    });
    const document = await _Document.default.findByPk(documentId);
    if (!document) {
      return;
    }
    let text = format === _types.FileOperationFormat.HTMLZip ? await _DocumentHelper.DocumentHelper.toHTML(document, {
      centered: true
    }) : await _DocumentHelper.DocumentHelper.toMarkdown(document);
    const attachmentIds = includeAttachments ? _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document)) : [];
    const attachments = attachmentIds.length ? await _Attachment.default.findAll({
      where: {
        teamId: document.teamId,
        id: attachmentIds
      }
    }) : [];

    // Add any referenced attachments to the zip file and replace the
    // reference in the document with the path to the attachment in the zip
    for (const attachment of attachments) {
      _Logger.default.debug("task", `Adding attachment to archive`, {
        documentId,
        key: attachment.key
      });

      // Skip attachments with a malformed key that has no filename component,
      // as yazl rejects entries whose path ends with a slash.
      if (!attachment.key || attachment.key.endsWith("/")) {
        _Logger.default.warn(`Skipping attachment with invalid key`, {
          attachmentId: attachment.id,
          teamId: attachment.teamId,
          key: attachment.key
        });
        continue;
      }
      const dir = _nodePath.default.dirname(pathInZip);
      let buffer;
      try {
        buffer = await attachment.buffer;
      } catch (err) {
        _Logger.default.warn(`Failed to read attachment from storage`, {
          attachmentId: attachment.id,
          teamId: attachment.teamId,
          error: (0, _error.errToString)(err)
        });
        buffer = Buffer.from("");
      }
      zip.addBuffer(buffer, _nodePath.default.join(dir, attachment.key), {
        mtime: attachment.updatedAt
      });
      text = text.replace(new RegExp((0, _compat.escapeRegExp)(attachment.redirectUrl), "g"), encodeURI(attachment.key));
    }

    // Replace any internal links with relative paths to the document in the zip
    const internalLinks = [...text.matchAll(/\/doc\/(?:[0-9a-zA-Z-_~]*-)?([a-zA-Z0-9]{10,15})/g)];
    internalLinks.forEach(match => {
      const matchedLink = match[0];
      const matchedDocPath = pathMap.get(matchedLink);
      if (matchedDocPath) {
        const relativePath = _nodePath.default.relative(pathInZip, matchedDocPath);
        if (relativePath.startsWith(".")) {
          text = text.replace(matchedLink, encodeURI(relativePath.substring(1)));
        }
      }
    });

    // Finally, add the document to the zip file
    zip.addBuffer(Buffer.from(text), pathInZip, {
      mtime: document.updatedAt,
      fileComment: JSON.stringify({
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      })
    });
  }

  /**
   * Exports the documents and attachments in the given collections to a zip file
   * and returns the path to the zip file in tmp.
   *
   * @param zip The yazl ZipFile to add files to
   * @param collections The collections to export
   * @param format The format to export in
   * @param includeAttachments Whether to include attachments in the export
   *
   * @returns The path to the zip file in tmp.
   */
  async addCollectionsToArchive(zip, collections, format) {
    let includeAttachments = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    const pathMap = this.createPathMap(collections, format);
    await this.addDocumentsToArchive({
      zip,
      pathMap,
      format,
      includeAttachments
    });
    return await _ZipHelper.default.toTmpFile(zip);
  }
  async addDocumentToArchive(_ref2) {
    let {
      document,
      format,
      documentStructure,
      zip
    } = _ref2;
    const pathMap = new Map();
    const extension = format === _types.FileOperationFormat.HTMLZip ? "html" : "md";
    const rootFolderName = (0, _fs.serializeFilename)(document.titleWithDefault);

    // entry for root document
    pathMap.set(document.path, `${rootFolderName}.${extension}`);
    this.addDocumentTreeToPathMap(pathMap, documentStructure, (0, _fs.serializeFilename)(document.titleWithDefault), format);
    await this.addDocumentsToArchive({
      zip,
      pathMap,
      format,
      includeAttachments: true
    });
    return await _ZipHelper.default.toTmpFile(zip);
  }

  /**
   * Processes each unique document in the path map and adds it to the zip.
   *
   * @param zip The yazl ZipFile to add files to
   * @param pathMap Map of document urls to their path in the zip
   * @param format The format to export in
   * @param includeAttachments Whether to include attachments in the export
   */
  async addDocumentsToArchive(_ref3) {
    let {
      zip,
      pathMap,
      format,
      includeAttachments
    } = _ref3;
    const processedPaths = new Set();
    _Logger.default.debug("task", `Start adding documents to archive`);
    for (const [url, pathInZip] of pathMap) {
      // A document may be keyed by multiple urls in the path map, only
      // process each file in the zip once.
      if (processedPaths.has(pathInZip)) {
        continue;
      }
      processedPaths.add(pathInZip);
      await this.processDocument({
        zip,
        pathInZip,
        documentId: url.replace("/doc/", ""),
        includeAttachments,
        format,
        pathMap
      });
    }
    _Logger.default.debug("task", "Completed adding documents to archive");
  }

  /**
   * Generates a map of document urls to their path in the zip file.
   *
   * @param collections The collections to generate the path map for.
   * @param format The format of the exported documents.
   */
  createPathMap(collections, format) {
    const map = new Map();
    const usedRoots = new Set();
    for (const collection of collections) {
      if (collection.documentStructure) {
        let root = (0, _fs.serializeFilename)(collection.name);
        let i = 0;
        while (usedRoots.has(root)) {
          root = `${(0, _fs.serializeFilename)(collection.name)} (${++i})`;
        }
        usedRoots.add(root);
        this.addDocumentTreeToPathMap(map, collection.documentStructure, root, format);
      }
    }
    return map;
  }
  addDocumentTreeToPathMap(map, nodes, root, format) {
    for (const node of nodes) {
      const title = (0, _fs.serializeFilename)(node.title) || "Untitled";
      const extension = format === _types.FileOperationFormat.HTMLZip ? "html" : "md";

      // Ensure the document is given a unique path in zip, even if it has
      // the same title as another document in the same collection.
      let i = 0;
      let filePath = _nodePath.default.join(root, `${title}.${extension}`);
      while (Array.from(map.values()).includes(filePath)) {
        filePath = _nodePath.default.join(root, `${title} (${++i}).${extension}`);
      }
      map.set(node.url, filePath);

      // If this is an imported document, the references to this doc are in the 'doc/{docId}' format.
      // Set this format to replace them with relative URLs in the zip.
      map.set(`/doc/${node.id}`, filePath);
      if (node.children?.length) {
        this.addDocumentTreeToPathMap(map, node.children, _nodePath.default.join(root, title), format);
      }
    }
  }
}
exports.default = ExportDocumentTreeTask;