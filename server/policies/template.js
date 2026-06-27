"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "updateTemplate", _models.Team, (actor, team) => (0, _utils.and)(
//
actor.isAdmin, (0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Template, (actor, template) => (0, _utils.and)((0, _utils.isTeamModel)(actor, template), (0, _utils.or)((0, _utils.and)(!!template?.isWorkspaceTemplate, (0, _cancan.can)(actor, "read", actor.team)), (0, _cancan.can)(actor, "readDocument", template?.collection))));
(0, _cancan.allow)(_models.User, "listRevisions", _models.Template, (actor, template) => (0, _utils.or)((0, _utils.and)((0, _cancan.can)(actor, "read", template), !actor.isGuest), (0, _utils.and)((0, _cancan.can)(actor, "update", template), actor.isGuest)));
(0, _cancan.allow)(_models.User, ["update", "move", "duplicate"], _models.Template, (actor, template) => (0, _utils.and)((0, _cancan.can)(actor, "read", template), (0, _utils.isTeamMutable)(actor), (0, _utils.or)((0, _utils.and)(!!template?.isWorkspaceTemplate, (0, _cancan.can)(actor, "updateTemplate", actor.team)), (0, _cancan.can)(actor, "manageTemplate", template?.collection))));
(0, _cancan.allow)(_models.User, "delete", _models.Template, (actor, template) => (0, _utils.and)(
//
(0, _cancan.can)(actor, "update", template), !template?.isDeleted));
(0, _cancan.allow)(_models.User, "restore", _models.Template, (actor, template) => (0, _utils.and)(
//
!!template?.isDeleted, (0, _utils.isTeamModel)(actor, template), (0, _utils.isTeamMutable)(actor), (0, _utils.or)((0, _utils.and)(!!template?.isWorkspaceTemplate, (0, _cancan.can)(actor, "updateTemplate", actor.team)), (0, _cancan.can)(actor, "manageTemplate", template?.collection))));