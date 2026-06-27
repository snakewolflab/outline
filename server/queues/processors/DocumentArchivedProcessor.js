"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("../../context");
var _models = require("../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class DocumentArchivedProcessor extends _BaseProcessor.default {
  /**
   * Performs the processor action when a document is archived.
   * Removes the document from the actor's starred documents.
   *
   * @param event The document archive event.
   * @returns A promise that resolves when the operation is complete.
   * @throws {Error} If the database operation fails.
   */
  async perform(event) {
    const star = await _models.Star.findOne({
      where: {
        documentId: event.documentId,
        userId: event.actorId
      }
    });
    if (star) {
      const user = await _models.User.findByPk(event.actorId, {
        rejectOnEmpty: true
      });
      await star.destroyWithCtx((0, _context.createContext)({
        user,
        ip: event.ip
      }));
    }
  }
}
exports.default = DocumentArchivedProcessor;
_defineProperty(DocumentArchivedProcessor, "applicableEvents", ["documents.archive"]);