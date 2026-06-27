"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _yazl = require("yazl");
var _compat = require("es-toolkit/compat");
var _error = require("../../../shared/utils/error");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _presenters = require("../../presenters");
var _ZipHelper = _interopRequireDefault(require("../../utils/ZipHelper"));
var _fs = require("../../utils/fs");
var _package = _interopRequireDefault(require("../../../package.json"));
var _ExportTask = _interopRequireDefault(require("./ExportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportJSONTask extends _ExportTask.default {
  async exportCollections(collections, fileOperation) {
    const zip = new _yazl.ZipFile();
    const usedFilenames = new Set();

    // serial to avoid overloading, slow and steady wins the race
    for (const collection of collections) {
      let filename = (0, _fs.serializeFilename)(collection.name);
      let i = 0;
      while (usedFilenames.has(filename)) {
        filename = `${(0, _fs.serializeFilename)(collection.name)} (${++i})`;
      }
      usedFilenames.add(filename);
      await this.addCollectionToArchive(zip, collection, fileOperation.options?.includeAttachments ?? true, filename);
    }
    await this.addMetadataToArchive(zip, fileOperation);
    return _ZipHelper.default.toTmpFile(zip);
  }
  async addMetadataToArchive(zip, fileOperation) {
    const user = await fileOperation.$get("user");
    const metadata = {
      exportVersion: 1,
      version: _package.default.version,
      createdAt: new Date().toISOString(),
      createdById: fileOperation.userId,
      createdByEmail: user?.email ?? null
    };
    zip.addBuffer(Buffer.from(_env.default.isDevelopment ? JSON.stringify(metadata, null, 2) : JSON.stringify(metadata)), `metadata.json`);
  }
  async addCollectionToArchive(zip, collection, includeAttachments, filename) {
    const output = {
      collection: {
        ...(0, _compat.omit)(await (0, _presenters.presentCollection)(undefined, collection), ["url", "description"]),
        documentStructure: collection.documentStructure
      },
      documents: {},
      attachments: {}
    };
    async function addAttachments(attachments) {
      for (const attachment of attachments) {
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
        zip.addBuffer(buffer, attachment.key, {
          mtime: attachment.updatedAt
        });
        output.attachments[attachment.id] = {
          ...(0, _compat.omit)((0, _presenters.presentAttachment)(attachment), "url"),
          key: attachment.key
        };
      }
    }
    async function addDocumentTree(nodes) {
      for (const node of nodes) {
        const document = await _models.Document.findByPk(node.id, {
          includeState: true
        });
        if (!document) {
          continue;
        }
        const documentAttachments = includeAttachments ? await _models.Attachment.findAll({
          where: {
            teamId: document.teamId,
            id: _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document))
          }
        }) : [];
        await addAttachments(documentAttachments);
        output.documents[document.id] = {
          id: document.id,
          urlId: document.urlId,
          title: document.title,
          icon: document.icon,
          color: document.color,
          data: _DocumentHelper.DocumentHelper.toProsemirror(document).toJSON(),
          createdById: document.createdById,
          createdByName: document.createdBy.name,
          createdByEmail: document.createdBy.email,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
          publishedAt: document.publishedAt ? document.publishedAt.toISOString() : null,
          fullWidth: document.fullWidth,
          parentDocumentId: document.parentDocumentId
        };
        if (node.children?.length > 0) {
          await addDocumentTree(node.children);
        }
      }
    }
    const collectionAttachments = includeAttachments ? await _models.Attachment.findAll({
      where: {
        teamId: collection.teamId,
        id: _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(collection))
      }
    }) : [];
    await addAttachments(collectionAttachments);
    if (collection.documentStructure) {
      await addDocumentTree(collection.documentStructure);
    }
    zip.addBuffer(Buffer.from(_env.default.isDevelopment ? JSON.stringify(output, null, 2) : JSON.stringify(output)), `${filename}.json`);
  }
  async exportDocument() {
    throw new Error("JSON export unsupported for individual document.");
  }
}
exports.default = ExportJSONTask;