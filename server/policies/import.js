"use strict";

var _types = require("../../shared/types");
var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
const TerminalStates = [_types.ImportState.Completed, _types.ImportState.Errored, _types.ImportState.Canceled];
(0, _cancan.allow)(_models.User, ["createImport", "listImports"], _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Import, (actor, importModel) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, importModel), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "delete", _models.Import, (actor, importModel) => (0, _utils.and)((0, _cancan.can)(actor, "read", importModel), !!importModel && TerminalStates.includes(importModel.state)));
(0, _cancan.allow)(_models.User, "cancel", _models.Import, (actor, importModel) => (0, _utils.and)((0, _cancan.can)(actor, "read", importModel), importModel?.createdById === actor.id, (0, _utils.or)(importModel?.state === _types.ImportState.Created, importModel?.state === _types.ImportState.InProgress, importModel?.state === _types.ImportState.Processed)));