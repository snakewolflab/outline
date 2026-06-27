"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _compat = require("es-toolkit/compat");
var _validations = require("../../shared/validations");
var _editor = require("../editor");
var _tracing = require("../logging/tracing");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _DocumentConverter = require("../utils/DocumentConverter");
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Converts document content to state and validates size constraints.
 *
 * @param content The document content as Prosemirror JSON.
 * @param title The document title (used in error messages).
 * @returns The Y.Doc state buffer.
 */
function convertToState(content, title) {
  const ydoc = _ProsemirrorHelper.ProsemirrorHelper.toYDoc(content);
  const state = _ProsemirrorHelper.ProsemirrorHelper.toState(ydoc);
  if (state.length > _validations.DocumentValidation.maxStateLength) {
    throw (0, _errors.InvalidRequestError)(`The document "${title}" is too large to import, please reduce the length and try again`);
  }
  return state;
}
async function documentImporter(_ref) {
  let {
    mimeType,
    fileName,
    content,
    user,
    ctx
  } = _ref;
  // Find valid extensions and remove them from the title
  const extensions = ["docx", "md", "markdown", "html", ...(_mimeTypes.default.extensions[mimeType] ?? [])];
  const fileTitle = fileName.replace(new RegExp(`\\.(${extensions.join("|")})$`, "i"), "");

  // Convert document using unified converter
  const {
    doc,
    title: extractedTitle,
    icon
  } = await _DocumentConverter.DocumentConverter.convert(content, fileName, mimeType);

  // Use extracted title or fall back to filename
  let title = extractedTitle || fileTitle;

  // Replace external images with attachments
  const processedDoc = await _ProsemirrorHelper.ProsemirrorHelper.replaceImagesWithAttachments(ctx, doc, user);

  // Serialize final text and handle empty documents
  let text = _editor.serializer.serialize(processedDoc).trim();
  // Empty paragraphs serialize to escaped newlines/backslashes, treat as empty
  if (/^[\\\s]*$/.test(text)) {
    text = "";
  }

  // Truncate title and validate size
  title = (0, _compat.truncate)(title, {
    length: _validations.DocumentValidation.maxTitleLength
  });
  const state = convertToState(processedDoc.toJSON(), title);
  return {
    text,
    state,
    title,
    icon
  };
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "documentImporter"
})(documentImporter);