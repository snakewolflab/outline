"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../models");
var _database = require("../../storage/database");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
var _sequelize = require("sequelize");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class DocumentMovedProcessor extends _BaseProcessor.default {
  async perform(event) {
    await _database.sequelize.transaction(async transaction => {
      const document = await _models.Document.findByPk(event.documentId, {
        transaction
      });
      if (!document) {
        return;
      }

      // If there are any sourced memberships for this document, we need to go to the source
      // memberships and recalculate the membership for the user or group.
      const [parentDocumentUserMemberships, parentDocumentGroupMemberships] = await Promise.all([document.parentDocumentId ? _models.UserMembership.findRootMembershipsForDocument(document.parentDocumentId, undefined, {
        transaction
      }) : [], document.parentDocumentId ? _models.GroupMembership.findRootMembershipsForDocument(document.parentDocumentId, undefined, {
        transaction
      }) : []]);
      await this.destroyUserMemberships(document.id);
      await this.destroyGroupMemberships(document.id);
      await this.recalculateUserMemberships(parentDocumentUserMemberships, transaction, document.id);
      await this.recalculateGroupMemberships(parentDocumentGroupMemberships, transaction, document.id);
    });
  }
  async destroyUserMemberships(documentId) {
    const document = await _models.Document.findByPk(documentId);
    const childDocumentIds = await document.findAllChildDocumentIds();
    await _models.UserMembership.destroy({
      where: {
        sourceId: {
          [_sequelize.Op.ne]: null
        },
        documentId: [...childDocumentIds, documentId]
      }
    });
  }
  async destroyGroupMemberships(documentId) {
    const document = await _models.Document.findByPk(documentId);
    const childDocumentIds = await document.findAllChildDocumentIds();
    await _models.GroupMembership.destroy({
      where: {
        sourceId: {
          [_sequelize.Op.ne]: null
        },
        documentId: [...childDocumentIds, documentId]
      }
    });
  }
  async recalculateUserMemberships(memberships, transaction, documentId) {
    await Promise.all(memberships.map(membership => _models.UserMembership.createSourcedMemberships(membership, {
      transaction,
      documentId
    })));
  }
  async recalculateGroupMemberships(memberships, transaction, documentId) {
    await Promise.all(memberships.map(membership => _models.GroupMembership.createSourcedMemberships(membership, {
      transaction,
      documentId
    })));
  }
}
exports.default = DocumentMovedProcessor;
_defineProperty(DocumentMovedProcessor, "applicableEvents", ["documents.move"]);