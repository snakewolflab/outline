"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "update", _models.Revision, (actor, revision) => (0, _utils.and)(
//
(0, _utils.or)(actor.id === revision?.userId, actor.isAdmin), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "delete", _models.Revision, actor => (0, _utils.and)(
//
actor.isAdmin, (0, _utils.isTeamMutable)(actor)));