"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentRelationship;
function presentRelationship(relationship) {
  return {
    id: relationship.id,
    type: relationship.type,
    documentId: relationship.documentId,
    reverseDocumentId: relationship.reverseDocumentId,
    userId: relationship.userId,
    createdAt: relationship.createdAt,
    updatedAt: relationship.updatedAt
  };
}