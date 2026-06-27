"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createUserPasskey", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), !!team?.passkeysEnabled));
(0, _cancan.allow)(_models.User, ["read", "update", "delete"], _models.UserPasskey, (actor, passkey) => passkey?.userId === actor.id);