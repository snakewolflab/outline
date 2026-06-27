"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAttachmentIds;
var _compat = require("es-toolkit/compat");
var _ProsemirrorHelper = require("../../shared/utils/ProsemirrorHelper");
function parseAttachmentIds(text) {
  let includePublic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (0, _compat.uniq)((0, _compat.compact)([...text.matchAll(_ProsemirrorHelper.attachmentRedirectRegex), ...(includePublic ? text.matchAll(_ProsemirrorHelper.attachmentPublicRegex) : [])].map(match => match.groups && match.groups.id)));
}