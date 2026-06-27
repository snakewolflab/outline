"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createEmoji", _models.Team, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, "read", _models.Emoji, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.Emoji, (actor, emoji) => (0, _utils.or)((0, _utils.isOwner)(actor, emoji), (0, _utils.isTeamAdmin)(actor, emoji)));