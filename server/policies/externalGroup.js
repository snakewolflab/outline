"use strict";

var _models = require("../models");
var _User = _interopRequireDefault(require("../models/User"));
var _cancan = require("./cancan");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _cancan.allow)(_User.default, "read", _models.ExternalGroup, _utils.isTeamAdmin);