"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../models");
var _CollectionSubscriptionRemoveUserTask = _interopRequireDefault(require("../tasks/CollectionSubscriptionRemoveUserTask"));
var _DocumentSubscriptionRemoveUserTask = _interopRequireDefault(require("../tasks/DocumentSubscriptionRemoveUserTask"));
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class DocumentSubscriptionProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "collections.remove_user":
        {
          await new _CollectionSubscriptionRemoveUserTask.default().schedule(event);
          return;
        }
      case "collections.remove_group":
        return this.handleRemoveGroupFromCollection(event);
      case "documents.remove_user":
        {
          await new _DocumentSubscriptionRemoveUserTask.default().schedule(event);
          return;
        }
      case "documents.remove_group":
        return this.handleRemoveGroupFromDocument(event);
      default:
    }
  }
  async handleRemoveGroupFromCollection(event) {
    await _models.GroupUser.findAllInBatches({
      where: {
        groupId: event.modelId
      },
      batchLimit: 10
    }, async groupUsers => {
      await Promise.all(groupUsers.map(groupUser => new _CollectionSubscriptionRemoveUserTask.default().schedule({
        ...event,
        name: "collections.remove_user",
        userId: groupUser.userId
      })));
    });
  }
  async handleRemoveGroupFromDocument(event) {
    await _models.GroupUser.findAllInBatches({
      where: {
        groupId: event.modelId
      },
      batchLimit: 10
    }, async groupUsers => {
      await Promise.all(groupUsers.map(groupUser => new _DocumentSubscriptionRemoveUserTask.default().schedule({
        ...event,
        name: "documents.remove_user",
        userId: groupUser.userId
      })));
    });
  }
}
exports.default = DocumentSubscriptionProcessor;
_defineProperty(DocumentSubscriptionProcessor, "applicableEvents", ["collections.remove_user", "collections.remove_group", "documents.remove_user", "documents.remove_group"]);