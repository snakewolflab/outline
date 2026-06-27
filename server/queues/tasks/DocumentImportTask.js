"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _error = require("../../../shared/utils/error");
var _documentCreator = _interopRequireDefault(require("../../commands/documentCreator"));
var _documentImporter = _interopRequireDefault(require("../../commands/documentImporter"));
var _context = require("../../context");
var _models = require("../../models");
var _files = _interopRequireDefault(require("../../storage/files"));
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentImportTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      key,
      sourceMetadata,
      ip,
      publish,
      collectionId,
      parentDocumentId,
      userId
    } = _ref;
    try {
      const content = await _files.default.getFileBuffer(key);
      const user = await _models.User.findByPk(userId, {
        rejectOnEmpty: true
      });

      // Run document conversion and image downloading outside a transaction
      const ctx = (0, _context.createContext)({
        user,
        ip
      });
      const {
        text,
        state,
        title,
        icon
      } = await (0, _documentImporter.default)({
        user,
        fileName: sourceMetadata.fileName,
        mimeType: sourceMetadata.mimeType,
        content,
        ctx
      });
      const document = await _database.sequelize.transaction(async transaction => (0, _documentCreator.default)((0, _context.createContext)({
        user,
        ip,
        transaction
      }), {
        sourceMetadata,
        title,
        icon,
        text,
        state,
        publish,
        collectionId,
        parentDocumentId
      }));
      return {
        documentId: document.id
      };
    } catch (err) {
      return {
        error: (0, _error.errToString)(err)
      };
    } finally {
      await _files.default.deleteFile(key);
    }
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = DocumentImportTask;