"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _context = require("../../context");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SupportedIntegrations = [_types.IntegrationService.Linear, _types.IntegrationService.Figma];
/**
 * A task that uploads the provided logoUrl to storage and updates the
 * associated integration record with the new url.
 */
class UploadIntegrationLogoTask extends _BaseTask.BaseTask {
  async perform(props) {
    const integration = await _models.Integration.scope("withAuthentication").findByPk(props.integrationId);
    if (!integration || !SupportedIntegrations.includes(integration.service)) {
      return;
    }
    const user = await _models.User.findByPk(integration.userId);
    if (!user) {
      return;
    }
    const attachment = await (0, _attachmentCreator.default)({
      name: "logo",
      url: props.logoUrl,
      user,
      preset: _types.AttachmentPreset.Avatar,
      ctx: (0, _context.createContext)({
        user
      }),
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${integration.authentication.token}`
        }
      }
    });
    if (!attachment) {
      return;
    }
    switch (integration.service) {
      case _types.IntegrationService.Linear:
        integration.settings.linear.workspace.logoUrl = attachment.url;
        break;
      case _types.IntegrationService.Figma:
        integration.settings.figma.account.avatarUrl = attachment.url;
        break;
      default:
        throw new Error(`Unsupported integration service: ${integration.service}`);
      // This should never happen
    }
    integration.changed("settings", true);
    await integration.save();
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadIntegrationLogoTask;