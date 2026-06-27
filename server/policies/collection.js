"use strict";

var _invariant = _interopRequireDefault(require("invariant"));
var _types = require("../../shared/types");
var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _cancan.allow)(_models.User, "createCollection", _models.Team, (actor, team) => (0, _utils.and)(!actor.isGuest, !actor.isViewer, (0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), (0, _utils.or)(actor.isAdmin, !!team?.memberCollectionCreate)));
(0, _cancan.allow)(_models.User, "importCollection", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "move", _models.Collection, (actor, collection) => (0, _utils.and)(
//
!!collection?.isActive, (0, _utils.isTeamAdmin)(actor, collection), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Collection, (user, collection) => {
  if (!collection || user.teamId !== collection.teamId) {
    return false;
  }
  if (user.isAdmin) {
    return true;
  }
  if (collection.isPrivate || user.isGuest) {
    return includesMembership(collection, Object.values(_types.CollectionPermission));
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["readDocument", "star", "unstar", "subscribe", "unsubscribe"], _models.Collection, (user, collection) => {
  if (!collection || user.teamId !== collection.teamId) {
    return false;
  }
  if (collection.isPrivate || user.isGuest) {
    return includesMembership(collection, Object.values(_types.CollectionPermission));
  }
  return true;
});
(0, _cancan.allow)(_models.User, "share", _models.Collection, (user, collection) => {
  if (!collection || user.isGuest || user.teamId !== collection.teamId || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (!collection.sharing) {
    return false;
  }
  if (!collection.isPrivate && user.isAdmin) {
    return true;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, "updateDocument", _models.Collection, (user, collection) => {
  if (!collection || !(0, _utils.isTeamModel)(user, collection) || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer || user.isGuest) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["createDocument", "deleteDocument"], _models.Collection, (user, collection) => {
  if (!collection || !collection.isActive || !(0, _utils.isTeamModel)(user, collection) || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer || user.isGuest) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["createTemplate", "manageTemplate"], _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !!collection?.isActive, (0, _utils.isTeamModel)(user, collection), (0, _utils.isTeamMutable)(user), (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]), (0, _utils.and)(collection?.templateManagement === _types.CollectionPermission.ReadWrite, !user.isGuest, (0, _utils.or)((0, _utils.and)(collection?.permission === _types.CollectionPermission.ReadWrite, !user.isViewer), includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]))))));
(0, _cancan.allow)(_models.User, ["update", "export", "archive"], _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !!collection?.isActive, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
(0, _cancan.allow)(_models.User, "delete", _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !collection?.deletedAt, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
(0, _cancan.allow)(_models.User, "restore", _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !collection?.isActive, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
function includesMembership(collection, permissions) {
  if (!collection) {
    return false;
  }
  (0, _invariant.default)(collection.memberships, "Development: collection memberships not preloaded, did you forget `withMembership` scope?");
  (0, _invariant.default)(collection.groupMemberships, "Development: collection groupMemberships not preloaded, did you forget `withMembership` scope?");
  const permissionSet = new Set(permissions);
  const membershipIds = [];
  for (const membership of collection.memberships) {
    if (permissionSet.has(membership.permission)) {
      membershipIds.push(membership.id);
    }
  }
  for (const membership of collection.groupMemberships) {
    if (permissionSet.has(membership.permission)) {
      membershipIds.push(membership.id);
    }
  }
  return membershipIds.length > 0 ? membershipIds : false;
}