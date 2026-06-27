"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _models = require("../../models");
var _Relationship = require("../../models/Relationship");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class BacklinksProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.publish":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) {
            return;
          }

          // Note: These can be UUID or slugs
          const linkIds = _DocumentHelper.DocumentHelper.parseDocumentIds(document);
          await Promise.all(linkIds.map(async linkId => {
            const linkedDocument = await _models.Document.findByPk(linkId, {
              attributes: ["id", "teamId"]
            });
            if (!linkedDocument || linkedDocument.id === event.documentId || linkedDocument.teamId !== document.teamId) {
              return;
            }
            const existing = await _models.Relationship.findOne({
              where: {
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId,
                type: _Relationship.RelationshipType.Backlink
              }
            });
            if (!existing) {
              await _models.Relationship.create({
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId,
                userId: document.lastModifiedById,
                type: _Relationship.RelationshipType.Backlink
              });
            }
          }));
          break;
        }
      case "documents.update":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) {
            return;
          }

          // backlinks are only created for published documents
          if (!document.publishedAt) {
            return;
          }
          const linkIds = _DocumentHelper.DocumentHelper.parseDocumentIds(document);
          const linkedDocumentIds = [];

          // create or find existing backlink records for referenced docs
          await Promise.all(linkIds.map(async linkId => {
            const linkedDocument = await _models.Document.findByPk(linkId, {
              attributes: ["id", "teamId"]
            });
            if (!linkedDocument || linkedDocument.id === event.documentId || linkedDocument.teamId !== document.teamId) {
              return;
            }
            const existing = await _models.Relationship.findOne({
              where: {
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId,
                type: _Relationship.RelationshipType.Backlink
              }
            });
            if (!existing) {
              await _models.Relationship.create({
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId,
                userId: document.lastModifiedById,
                type: _Relationship.RelationshipType.Backlink
              });
            }
            linkedDocumentIds.push(linkedDocument.id);
          }));

          // delete any backlinks that no longer exist
          await _models.Relationship.destroy({
            where: {
              documentId: {
                [_sequelize.Op.notIn]: linkedDocumentIds
              },
              reverseDocumentId: event.documentId,
              type: _Relationship.RelationshipType.Backlink
            }
          });
          break;
        }
      case "documents.delete":
        {
          await _models.Relationship.destroy({
            where: {
              [_sequelize.Op.or]: [{
                reverseDocumentId: event.documentId
              }, {
                documentId: event.documentId
              }],
              type: _Relationship.RelationshipType.Backlink
            }
          });
          break;
        }
      default:
    }
  }
}
exports.default = BacklinksProcessor;
_defineProperty(BacklinksProcessor, "applicableEvents", ["documents.publish", "documents.update", "documents.delete"]);