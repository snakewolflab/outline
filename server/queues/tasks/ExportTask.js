"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _compat = require("es-toolkit/compat");
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _files = require("../../../shared/utils/files");
var _ExportFailureEmail = _interopRequireDefault(require("../../emails/templates/ExportFailureEmail"));
var _ExportSuccessEmail = _interopRequireDefault(require("../../emails/templates/ExportSuccessEmail"));
var _env = _interopRequireDefault(require("../../env"));
var _errors = require("../../errors");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _fileOperation = _interopRequireDefault(require("../../presenters/fileOperation"));
var _files2 = _interopRequireDefault(require("../../storage/files"));
var _BaseTask = require("./base/BaseTask");
var _sequelize = require("sequelize");
var _database = require("../../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportTask extends _BaseTask.BaseTask {
  /**
   * Transforms the data to be exported, uploads, and notifies user.
   *
   * @param props The props
   */
  async perform(_ref) {
    let {
      fileOperationId
    } = _ref;
    _Logger.default.info("task", `ExportTask fetching data for ${fileOperationId}`);
    const fileOperation = await _models.FileOperation.findByPk(fileOperationId, {
      rejectOnEmpty: true
    });
    const [team, user] = await Promise.all([_models.Team.findByPk(fileOperation.teamId, {
      rejectOnEmpty: true
    }), _models.User.findByPk(fileOperation.userId, {
      rejectOnEmpty: true
    })]);
    let filePath;
    let readStream;
    try {
      _Logger.default.info("task", `ExportTask processing data for ${fileOperationId}`, {
        options: fileOperation.options
      });
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Creating
      });
      filePath = await this.loadDataAndExport(fileOperation, user);
      _Logger.default.info("task", `ExportTask uploading data for ${fileOperationId}`);
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Uploading
      });
      const stat = await _fsExtra.default.stat(filePath);
      readStream = _fsExtra.default.createReadStream(filePath);
      const url = await _files2.default.store({
        body: readStream,
        contentLength: stat.size,
        contentType: "application/zip",
        key: fileOperation.key,
        acl: "private"
      });
      await this.updateFileOperation(fileOperation, {
        size: stat.size,
        state: _types.FileOperationState.Complete,
        url
      });
      if (user.subscribedToEventType(_types.NotificationEventType.ExportCompleted)) {
        await new _ExportSuccessEmail.default({
          to: user.email,
          language: user.language,
          userId: user.id,
          id: fileOperation.id,
          teamUrl: team.url,
          teamId: team.id
        }).schedule();
      }
    } catch (error) {
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Error,
        error: (0, _error.toError)(error)
      });
      if (user.subscribedToEventType(_types.NotificationEventType.ExportCompleted)) {
        await new _ExportFailureEmail.default({
          to: user.email,
          language: user.language,
          userId: user.id,
          teamUrl: team.url,
          teamId: team.id
        }).schedule();
      }
      throw error;
    } finally {
      // Destroy the read stream first to release the file handle before deletion
      if (readStream) {
        readStream.destroy();
      }
      if (filePath) {
        void _fsExtra.default.unlink(filePath).catch(error => {
          _Logger.default.error(`Failed to delete temporary file ${filePath}`, error);
        });
      }
    }
  }
  async loadDataAndExport(fileOperation, user) {
    if (fileOperation.documentId) {
      const document = await _models.Document.findByPk(fileOperation.documentId, {
        include: {
          model: _models.Collection.scope("withDocumentStructure"),
          as: "collection"
        },
        rejectOnEmpty: true
      });
      const documentStructure = document.collection?.getDocumentTree(document.id);
      if (!documentStructure) {
        throw new Error("Document not found in collection tree");
      }
      return this.exportDocument(document, documentStructure.children ?? []);
    }

    // ensure attachment size is within limits
    if (!fileOperation.collectionId) {
      const totalAttachmentsSize = await _models.Attachment.getTotalSizeForTeam(_database.sequelizeReadOnly, user.teamId);
      if (fileOperation.options?.includeAttachments && _env.default.MAXIMUM_EXPORT_SIZE && totalAttachmentsSize > _env.default.MAXIMUM_EXPORT_SIZE) {
        throw (0, _errors.ValidationError)(`${(0, _files.bytesToHumanReadable)(totalAttachmentsSize)} of attachments in workspace is larger than maximum export size of ${(0, _files.bytesToHumanReadable)(_env.default.MAXIMUM_EXPORT_SIZE)}.`);
      }
    }
    const where = {
      teamId: user.teamId
    };
    if (!fileOperation.options?.includePrivate) {
      where.permission = {
        [_sequelize.Op.ne]: null
      };
    }
    if (fileOperation.collectionId) {
      where.id = fileOperation.collectionId;
    } else {
      where.archivedAt = {
        [_sequelize.Op.eq]: null
      };
    }
    const collections = await _models.Collection.scope("withDocumentStructure").findAll({
      where
    });
    return this.exportCollections(collections, fileOperation);
  }

  /**
   * Transform the data in all of the passed collections into a single Buffer.
   *
   * @param collections The collections to export
   * @returns A promise that resolves to a temporary file path
   */

  /**
   * Transform the data in the document into a single Buffer.
   *
   * @param document The document to export
   * @param documentStructure Structure of document's children
   * @param fileOperation File operation associated with the export
   * @returns A promise that resolves to a temporary file path
   */

  /**
   * Update the state of the underlying FileOperation in the database and send
   * an event to the client.
   *
   * @param fileOperation The FileOperation to update
   */
  async updateFileOperation(fileOperation, options) {
    await fileOperation.update({
      ...options,
      error: options.error ? (0, _compat.truncate)(options.error.message, {
        length: 255
      }) : undefined
    }, {
      hooks: false
    });
    await _models.Event.schedule({
      name: "fileOperations.update",
      modelId: fileOperation.id,
      teamId: fileOperation.teamId,
      actorId: fileOperation.userId,
      data: (0, _fileOperation.default)(fileOperation)
    });
  }

  /**
   * Job options such as priority and retry strategy, as defined by Bull.
   */
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background,
      attempts: 1
    };
  }
}
exports.default = ExportTask;