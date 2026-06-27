"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.and = and;
exports.isCloudHosted = isCloudHosted;
exports.isGroupAdmin = isGroupAdmin;
exports.isOwner = isOwner;
exports.isTeamAdmin = isTeamAdmin;
exports.isTeamMember = isTeamMember;
exports.isTeamModel = isTeamModel;
exports.isTeamMutable = isTeamMutable;
exports.or = or;
var _env = _interopRequireDefault(require("../env"));
var _models = require("../models");
var _types = require("../../shared/types");
var _invariant = _interopRequireDefault(require("invariant"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function and() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  for (const arg of args) {
    if (!arg) {
      return false;
    }
  }
  return args;
}
function or() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  return args.find(Boolean) || false;
}

/**
 * Check if the actor is present in the same team as the model.
 *
 * @param actor The actor to check
 * @param model The model to check
 * @returns True if the actor is in the same team as the model
 */
function isTeamModel(actor, model) {
  if (!model) {
    return false;
  }
  if (model instanceof _models.Team) {
    return actor.teamId === model.id;
  }
  if ("teamId" in model) {
    return actor.teamId === model.teamId;
  }
  return false;
}

/**
 * Check if the actor is the owner of the model.
 *
 * @param actor The actor to check
 * @param model The model to check
 * @returns True if the actor is the owner of the model
 */
function isOwner(actor, model) {
  if (!model) {
    return false;
  }
  if ("userId" in model) {
    return actor.id === model.userId;
  }
  if ("createdById" in model) {
    return actor.id === model.createdById;
  }
  return false;
}

/**
 * Check if the actor is an admin of the team.
 *
 * @param actor The actor to check
 * @param mode The model to check
 * @returns True if the actor is an admin of the team the model belongs to
 */
function isTeamAdmin(actor, model) {
  return !!and(isTeamModel(actor, model), actor.isAdmin);
}

/**
 * Check if the actor is a member of the team.
 *
 * @param actor The actor to check
 * @param model The model to check
 * @returns True if the actor is a member of the team the model belongs to
 */
function isTeamMember(actor, model) {
  return !!and(isTeamModel(actor, model), actor.isMember);
}

/**
 * Check the actors team is mutable, meaning the team models can be modified.
 *
 * @param actor The actor to check
 * @returns True if the actor's team is mutable
 */
function isTeamMutable(_actor, _model) {
  return true;
}

/**
 * Check if this instance is running in the cloud-hosted environment.
 */
function isCloudHosted() {
  if (!_env.default.isCloudHosted) {
    return false;
  }
  return true;
}

/**
 * Check if the actor is an admin of the group.
 *
 * @param actor The actor to check
 * @param model The group model to check
 * @returns True if the actor is an admin of the group
 */
function isGroupAdmin(actor, model) {
  if (!model || !("id" in model)) {
    return false;
  }
  (0, _invariant.default)(model.groupUsers, "Group users relationship not loaded, ensure to include groupUsers when fetching the group");

  // Check if the user is a group admin
  const membership = model.groupUsers.find(gu => gu.userId === actor.id && gu.permission === _types.GroupPermission.Admin);
  if (membership) {
    return true;
  }

  // Team admins are always group admins
  if (isTeamAdmin(actor, model)) {
    return true;
  }
  return false;
}