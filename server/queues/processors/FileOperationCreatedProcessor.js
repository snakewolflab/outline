"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _models = require("../../models");
var _ExportHTMLZipTask = _interopRequireDefault(require("../tasks/ExportHTMLZipTask"));
var _ExportJSONTask = _interopRequireDefault(require("../tasks/ExportJSONTask"));
var _ExportMarkdownZipTask = _interopRequireDefault(require("../tasks/ExportMarkdownZipTask"));
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class FileOperationCreatedProcessor extends _BaseProcessor.default {
  async perform(event) {
    const fileOperation = await _models.FileOperation.unscoped().findByPk(event.modelId, {
      rejectOnEmpty: true
    });

    // Imports no longer flow through FileOperation — both JSON and Markdown
    // zip imports run through the API-import pipeline (`imports.create` →
    // {Markdown,JSON}APIImportTask). This dispatcher only handles exports.
    if (fileOperation.type === _types.FileOperationType.Export) {
      switch (fileOperation.format) {
        case _types.FileOperationFormat.HTMLZip:
          await new _ExportHTMLZipTask.default().schedule({
            fileOperationId: event.modelId
          });
          break;
        case _types.FileOperationFormat.MarkdownZip:
          await new _ExportMarkdownZipTask.default().schedule({
            fileOperationId: event.modelId
          });
          break;
        case _types.FileOperationFormat.JSON:
          await new _ExportJSONTask.default().schedule({
            fileOperationId: event.modelId
          });
          break;
        default:
      }
    }
  }
}
exports.default = FileOperationCreatedProcessor;
_defineProperty(FileOperationCreatedProcessor, "applicableEvents", ["fileOperations.create"]);