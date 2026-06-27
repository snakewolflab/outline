"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _yazl = require("yazl");
var _types = require("../../../shared/types");
var _ExportDocumentTreeTask = _interopRequireDefault(require("./ExportDocumentTreeTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportMarkdownZipTask extends _ExportDocumentTreeTask.default {
  async exportCollections(collections, fileOperation) {
    const zip = new _yazl.ZipFile();
    return await this.addCollectionsToArchive(zip, collections, _types.FileOperationFormat.MarkdownZip, fileOperation.options?.includeAttachments);
  }
  async exportDocument(document, documentStructure) {
    const zip = new _yazl.ZipFile();
    return await this.addDocumentToArchive({
      document,
      documentStructure,
      format: _types.FileOperationFormat.MarkdownZip,
      zip
    });
  }
}
exports.default = ExportMarkdownZipTask;