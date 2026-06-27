"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createGroup", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "listGroups", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, team), !actor.isGuest));
(0, _cancan.allow)(_models.User, "read", _models.Group, (actor, group) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, group), !actor.isGuest));
(0, _cancan.allow)(_models.User, "update", _models.Group, (actor, group) => (0, _utils.and)(
//
(0, _utils.isGroupAdmin)(actor, group), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "delete", _models.Group, (actor, group) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, group), (0, _utils.isTeamMutable)(actor), !Array.isArray(group?.externalGroups) || group.externalGroups.length === 0));