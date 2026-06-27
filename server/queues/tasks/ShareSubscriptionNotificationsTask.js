"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _ShareDocumentUpdatedEmail = _interopRequireDefault(require("../../emails/templates/ShareDocumentUpdatedEmail"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ShareSubscriptionNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    const document = await _models.Document.findByPk(event.documentId);
    if (!document) {
      return;
    }

    // Collect the document's ID and all ancestor IDs by walking up the tree.
    // A subscription scoped to any of these documents covers the updated one.
    const scopeIds = [document.id];
    let parentId = document.parentDocumentId;
    while (parentId) {
      scopeIds.push(parentId);
      const parent = await _models.Document.findByPk(parentId, {
        attributes: ["id", "parentDocumentId"]
      });
      if (!parent) {
        break;
      }
      parentId = parent.parentDocumentId;
    }

    // Find all active subscriptions scoped to this document or any ancestor,
    // joined to a published share that allows subscriptions.
    const subscriptions = await _models.ShareSubscription.scope("active").findAll({
      where: {
        documentId: scopeIds
      },
      include: [{
        model: _models.Share.unscoped(),
        required: true,
        where: {
          published: true,
          revokedAt: null,
          allowSubscriptions: true
        },
        include: [{
          association: "team",
          required: true
        }]
      }]
    });
    for (const subscription of subscriptions) {
      // Skip ancestor-scoped subscriptions when the share doesn't include
      // child documents — the updated document wouldn't be accessible.
      if (subscription.documentId !== document.id && !subscription.share.includeChildDocuments) {
        continue;
      }

      // Throttle: only one notification per 6 hours
      if (subscription.lastNotifiedAt && subscription.lastNotifiedAt > (0, _dateFns.subHours)(new Date(), 6)) {
        _Logger.default.info("processor", `suppressing share subscription notification to ${subscription.id} as recently notified`);
        continue;
      }
      const baseShareUrl = subscription.share.canonicalUrl;
      const shareUrl = document.id !== subscription.share.documentId && document.path ? `${baseShareUrl.replace(/\/$/, "")}${document.path}` : baseShareUrl;
      await new _ShareDocumentUpdatedEmail.default({
        to: subscription.email,
        shareSubscriptionId: subscription.id,
        documentTitle: document.titleWithDefault,
        shareUrl,
        revisionId: event.modelId
      }).schedule();
      subscription.lastNotifiedAt = new Date();
      await subscription.save();
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ShareSubscriptionNotificationsTask;