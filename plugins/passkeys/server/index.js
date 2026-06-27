"use strict";

var _PluginManager = require("../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _passkeys = _interopRequireDefault(require("./auth/passkeys"));
var _passkeys2 = _interopRequireDefault(require("./api/passkeys"));
var _PasskeyCreatedProcessor = require("./processors/PasskeyCreatedProcessor");
var _PasskeyCreatedEmail = require("./email/templates/PasskeyCreatedEmail");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_PluginManager.PluginManager.add([{
  ..._plugin.default,
  type: _PluginManager.Hook.AuthProvider,
  value: {
    router: _passkeys.default,
    id: _plugin.default.id
  }
}, {
  ..._plugin.default,
  type: _PluginManager.Hook.API,
  value: _passkeys2.default
}, {
  type: _PluginManager.Hook.Processor,
  value: _PasskeyCreatedProcessor.PasskeyCreatedProcessor
}, {
  type: _PluginManager.Hook.EmailTemplate,
  value: _PasskeyCreatedEmail.PasskeyCreatedEmail
}]);