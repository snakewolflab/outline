"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _CollectionAddUserNotificationsTask = _interopRequireDefault(require("../tasks/CollectionAddUserNotificationsTask"));
var _CollectionCreatedNotificationsTask = _interopRequireDefault(require("../tasks/CollectionCreatedNotificationsTask"));
var _CommentCreatedNotificationsTask = _interopRequireDefault(require("../tasks/CommentCreatedNotificationsTask"));
var _CommentUpdatedNotificationsTask = _interopRequireDefault(require("../tasks/CommentUpdatedNotificationsTask"));
var _ReactionCreatedNotificationsTask = _interopRequireDefault(require("../tasks/ReactionCreatedNotificationsTask"));
var _ReactionRemovedNotificationsTask = _interopRequireDefault(require("../tasks/ReactionRemovedNotificationsTask"));
var _DocumentAccessRequestNotificationsTask = _interopRequireDefault(require("../tasks/DocumentAccessRequestNotificationsTask"));
var _DocumentAddGroupNotificationsTask = _interopRequireDefault(require("../tasks/DocumentAddGroupNotificationsTask"));
var _DocumentAddUserNotificationsTask = _interopRequireDefault(require("../tasks/DocumentAddUserNotificationsTask"));
var _DocumentPublishedNotificationsTask = _interopRequireDefault(require("../tasks/DocumentPublishedNotificationsTask"));
var _RevisionCreatedNotificationsTask = _interopRequireDefault(require("../tasks/RevisionCreatedNotificationsTask"));
var _ShareSubscriptionNotificationsTask = _interopRequireDefault(require("../tasks/ShareSubscriptionNotificationsTask"));
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class NotificationsProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.publish":
        return this.documentPublished(event);
      case "documents.add_user":
        return this.documentAddUser(event);
      case "documents.add_group":
        return this.documentAddGroup(event);
      case "access_requests.create":
        return this.documentAccessRequest(event);
      case "revisions.create":
        return this.revisionCreated(event);
      case "collections.create":
        return this.collectionCreated(event);
      case "collections.add_user":
        return this.collectionAddUser(event);
      case "comments.create":
        return this.commentCreated(event);
      case "comments.update":
        return this.commentUpdated(event);
      case "comments.add_reaction":
        return this.reactionCreated(event);
      case "comments.remove_reaction":
        return this.reactionRemoved(event);
      default:
    }
  }
  async documentPublished(event) {
    // never send notifications when batch importing
    if (event.name === "documents.publish" && event.data?.source === "import") {
      return;
    }
    await new _DocumentPublishedNotificationsTask.default().schedule(event);
  }
  async documentAddUser(event) {
    if (!event.data.isNew || event.userId === event.actorId) {
      return;
    }
    await new _DocumentAddUserNotificationsTask.default().schedule(event);
  }
  async documentAddGroup(event) {
    if (!event.data.isNew) {
      return;
    }
    await new _DocumentAddGroupNotificationsTask.default().schedule(event);
  }
  async documentAccessRequest(event) {
    await new _DocumentAccessRequestNotificationsTask.default().schedule(event);
  }
  async revisionCreated(event) {
    await new _RevisionCreatedNotificationsTask.default().schedule(event);
    await new _ShareSubscriptionNotificationsTask.default().schedule(event);
  }
  async collectionCreated(event) {
    // never send notifications when batch importing
    if (!!event.changes?.attributes.apiImportId || !!event.changes?.attributes.importId) {
      return;
    }
    await new _CollectionCreatedNotificationsTask.default().schedule(event);
  }
  async collectionAddUser(event) {
    if (!event.data.isNew || event.userId === event.actorId) {
      return;
    }
    await new _CollectionAddUserNotificationsTask.default().schedule(event);
  }
  async commentCreated(event) {
    await new _CommentCreatedNotificationsTask.default().schedule(event);
  }
  async commentUpdated(event) {
    await new _CommentUpdatedNotificationsTask.default().schedule(event);
  }
  async reactionCreated(event) {
    await new _ReactionCreatedNotificationsTask.default().schedule(event);
  }
  async reactionRemoved(event) {
    await new _ReactionRemovedNotificationsTask.default().schedule(event);
  }
}
exports.default = NotificationsProcessor;
_defineProperty(NotificationsProcessor, "applicableEvents", ["documents.publish", "documents.add_user", "documents.add_group", "access_requests.create", "revisions.create", "collections.create", "collections.add_user", "comments.create", "comments.update", "comments.add_reaction", "comments.remove_reaction"]);