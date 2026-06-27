"use strict";

var _invariant = _interopRequireDefault(require("invariant"));
var _types = require("../../shared/types");
var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _cancan.allow)(_models.User, "createDocument", _models.Team, (actor, document) => (0, _utils.and)(
//
!actor.isGuest, !actor.isViewer, (0, _utils.isTeamModel)(actor, document), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Document, (actor, document) => (0, _utils.and)((0, _utils.isTeamModel)(actor, document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Read, _types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _utils.and)(!!document?.isDraft, actor.id === document?.createdById), (0, _cancan.can)(actor, "readDocument", document?.collection))));
(0, _cancan.allow)(_models.User, ["listRevisions", "listViews"], _models.Document, (actor, document) => (0, _utils.or)((0, _utils.and)(!actor.isGuest, (0, _cancan.can)(actor, "read", document)), (0, _utils.and)(actor.isGuest, (0, _cancan.can)(actor, "update", document))));
(0, _cancan.allow)(_models.User, "download", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "read", document), (0, _utils.or)((0, _utils.and)(!actor.isGuest, !actor.isViewer), !!actor.team.getPreference(_types.TeamPreference.ViewersCanExport))));
(0, _cancan.allow)(_models.User, "comment", _models.Document, (actor, document) => {
  const commenting = actor.team.getPreference(_types.TeamPreference.Commenting);
  return (0, _utils.and)(!!document?.isActive, (0, _utils.isTeamMutable)(actor), (0, _cancan.can)(actor, "read", document),
  // A legacy boolean `false` (team not yet migrated) means disabled.
  commenting !== _types.CommentingAccess.None && commenting !== false, (0, _utils.or)(!actor.isGuest, commenting === _types.CommentingAccess.Everyone), (0, _utils.or)(!document?.collection, document?.collection?.commenting !== false));
});
(0, _cancan.allow)(_models.User, ["star", "unstar", "subscribe", "unsubscribe"], _models.Document, (actor, document) => (0, _utils.and)(
//
(0, _cancan.can)(actor, "read", document)));
(0, _cancan.allow)(_models.User, "share", _models.Document, (actor, document) => (0, _utils.and)(!!document?.isActive, (0, _utils.isTeamMutable)(actor), (0, _cancan.can)(actor, "read", document), (0, _utils.or)(!document?.collection, (0, _cancan.can)(actor, "share", document?.collection))));
(0, _cancan.allow)(_models.User, "update", _models.Document, (actor, document) => (0, _utils.and)(!!document?.isActive, (0, _utils.isTeamMutable)(actor), (0, _cancan.can)(actor, "read", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _utils.or)((0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById)))));
(0, _cancan.allow)(_models.User, "publish", _models.Document, (actor, document) => (0, _utils.and)(
//
!!document?.isDraft, (0, _cancan.can)(actor, "update", document)));
(0, _cancan.allow)(_models.User, "manageUsers", _models.Document, (actor, document) => (0, _utils.and)((0, _utils.isTeamMutable)(actor), (0, _cancan.can)(actor, "read", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _utils.isTeamAdmin)(actor, document), (0, _cancan.can)(actor, "update", document?.collection), !!document?.isDraft && actor.id === document?.createdById)));
(0, _cancan.allow)(_models.User, "duplicate", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _utils.and)((0, _utils.isTeamAdmin)(actor, document), (0, _cancan.can)(actor, "read", document)), (0, _cancan.can)(actor, "updateDocument", document?.collection), !!document?.isDraft && actor.id === document?.createdById)));
(0, _cancan.allow)(_models.User, "move", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById), (0, _utils.and)(!!document?.isDraft && !document?.collection))));
(0, _cancan.allow)(_models.User, "createChildDocument", _models.Document, (actor, document) => (0, _utils.and)(
//
!document?.isDraft, (0, _cancan.can)(actor, "update", document)));
(0, _cancan.allow)(_models.User, ["updateInsights", "pin", "unpin"], _models.Document, (actor, document) => (0, _utils.and)(!document?.isDraft, !actor.isGuest, (0, _cancan.can)(actor, "update", document), (0, _cancan.can)(actor, "update", document?.collection)));
(0, _cancan.allow)(_models.User, "pinToHome", _models.Document, (actor, document) => (0, _utils.and)(
//
!document?.isDraft, !!document?.isActive, (0, _utils.isTeamAdmin)(actor, document), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "delete", _models.Document, (actor, document) => (0, _utils.and)(!document?.isDeleted, (0, _utils.isTeamModel)(actor, document), (0, _utils.isTeamMutable)(actor), (0, _utils.or)((0, _cancan.can)(actor, "unarchive", document), (0, _cancan.can)(actor, "update", document), (0, _utils.and)(!document?.collection, actor.id === document?.createdById))));
(0, _cancan.allow)(_models.User, "restore", _models.Document, (actor, document) => (0, _utils.and)(!actor.isGuest, !!document?.isDeleted, (0, _utils.isTeamModel)(actor, document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById))));
(0, _cancan.allow)(_models.User, "permanentDelete", _models.Document, (actor, document) => (0, _utils.and)(!actor.isGuest, !!document?.isDeleted, (0, _utils.isTeamModel)(actor, document), (0, _utils.isTeamAdmin)(actor, document)));
(0, _cancan.allow)(_models.User, "archive", _models.Document, (actor, document) => (0, _utils.and)(!document?.isDraft, !!document?.isActive, (0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _utils.and)((0, _utils.isTeamAdmin)(actor, document), (0, _cancan.can)(actor, "read", document)), (0, _cancan.can)(actor, "updateDocument", document?.collection))));
(0, _cancan.allow)(_models.User, "unarchive", _models.Document, (actor, document) => (0, _utils.and)(!document?.isDraft, !document?.isDeleted, !!document?.archivedAt, (0, _cancan.can)(actor, "read", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById))));
(0, _cancan.allow)(_models.Document, "restore", _models.Revision, (document, revision) => document.id === revision?.documentId);
(0, _cancan.allow)(_models.User, "unpublish", _models.Document, (user, document) => {
  if (!document || user.isGuest || user.isViewer || !document.isActive || document.isDraft) {
    return false;
  }
  (0, _invariant.default)(document.collection, "collection is missing, did you forget to include in the query scope?");
  if ((0, _cancan.cannot)(user, "updateDocument", document.collection)) {
    return false;
  }
  return user.teamId === document.teamId;
});
function includesMembership(document, permissions) {
  if (!document) {
    return false;
  }
  (0, _invariant.default)(document.memberships, "Development: document memberships should be preloaded, did you forget withMembership scope?");
  (0, _invariant.default)(document.groupMemberships, "Development: document groupMemberships should be preloaded, did you forget withMembership scope?");
  const permissionSet = new Set(permissions);
  const membershipIds = [];
  for (const membership of document.memberships) {
    if (permissionSet.has(membership.permission)) {
      membershipIds.push(membership.id);
    }
  }
  for (const membership of document.groupMemberships) {
    if (permissionSet.has(membership.permission)) {
      membershipIds.push(membership.id);
    }
  }
  return membershipIds.length > 0 ? membershipIds : false;
}