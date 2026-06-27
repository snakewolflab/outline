"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentAttachment;
function presentAttachment(attachment) {
  return {
    userId: attachment.userId,
    documentId: attachment.documentId,
    contentType: attachment.contentType,
    name: attachment.name,
    id: attachment.id,
    url: attachment.url,
    size: attachment.size
  };
}