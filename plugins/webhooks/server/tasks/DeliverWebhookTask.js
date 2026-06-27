"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.isExpectedNetworkError = isExpectedNetworkError;
var _nodeFetch = require("node-fetch");
var _sequelize = require("sequelize");
var _error = require("../../../../shared/utils/error");
var _collections = require("../../../../shared/utils/collections");
var _WebhookDisabledEmail = _interopRequireDefault(require("../../../../server/emails/templates/WebhookDisabledEmail"));
var _env = _interopRequireDefault(require("../../../../server/env"));
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _models = require("../../../../server/models");
var _presenters = require("../../../../server/presenters");
var _BaseTask = require("../../../../server/queues/tasks/base/BaseTask");
var _fetch = _interopRequireDefault(require("../../../../server/utils/fetch"));
var _webhook = _interopRequireDefault(require("../presenters/webhook"));
var _webhookSubscription = _interopRequireDefault(require("../presenters/webhookSubscription"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function assertUnreachable(event) {
  _Logger.default.warn(`DeliverWebhookTask did not handle ${event.name}`);
}

/**
 * Node connection-level error codes that are expected when delivering to
 * arbitrary, user-supplied webhook URLs. These indicate a misconfigured or
 * unreachable destination rather than a bug in Outline.
 */
const expectedNetworkErrorCodes = new Set(["ECONNRESET", "ECONNREFUSED", "ECONNABORTED", "ETIMEDOUT", "EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "EAI_AGAIN", "EPIPE", "EPROTO", "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID"]);

/**
 * Determine whether an error thrown while delivering a webhook is an expected
 * network failure caused by the user-supplied destination URL (connection
 * reset, timeout, unreachable host, invalid certificate, etc) rather than an
 * unexpected bug. Such failures are noisy and do not need error tracking.
 *
 * @param err The error that occurred during delivery.
 * @returns true if the error is an expected network failure.
 */
function isExpectedNetworkError(err) {
  if (err instanceof _nodeFetch.FetchError) {
    return true;
  }
  if (err instanceof Error) {
    const code = err.code;
    if (code && expectedNetworkErrorCodes.has(code)) {
      return true;
    }
    // node-fetch surfaces some low-level socket failures (and our fetch wrapper
    // converts aborted requests into timeouts) without a structured code.
    return /socket hang up|request timeout|network|ECONNRESET/i.test(err.message);
  }
  return false;
}
class DeliverWebhookTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      subscriptionId,
      event
    } = _ref;
    const subscription = await _models.WebhookSubscription.findByPk(subscriptionId, {
      rejectOnEmpty: true
    });
    if (!subscription.enabled) {
      _Logger.default.info("task", `WebhookSubscription was disabled before delivery`, {
        event: event.name,
        subscriptionId: subscription.id
      });
      return;
    }
    _Logger.default.info("task", `DeliverWebhookTask: ${event.name}`, {
      event: event.name,
      subscriptionId: subscription.id
    });
    switch (event.name) {
      case "attachments.create":
      case "attachments.update":
      case "attachments.delete":
        await this.handleAttachmentEvent(subscription, event);
        return;
      case "api_keys.create":
      case "api_keys.delete":
      case "subscriptions.create":
      case "subscriptions.delete":
      case "authenticationProviders.update":
      case "notifications.create":
      case "notifications.update":
      case "access_requests.create":
        // Ignored
        return;
      case "users.create":
      case "users.signin":
      case "users.signout":
      case "users.update":
      case "users.suspend":
      case "users.activate":
      case "users.delete":
      case "users.invite":
      case "users.promote":
      case "users.demote":
      case "users.invite_accepted":
        await this.handleUserEvent(subscription, event);
        return;
      case "documents.create":
      case "documents.publish":
      case "documents.unpublish":
      case "documents.delete":
      case "documents.permanent_delete":
      case "documents.archive":
      case "documents.unarchive":
      case "documents.restore":
      case "documents.move":
      case "documents.update":
      case "documents.title_change":
        await this.handleDocumentEvent(subscription, event);
        return;
      case "documents.add_user":
      case "documents.remove_user":
        await this.handleDocumentUserEvent(subscription, event);
        return;
      case "documents.add_group":
      case "documents.remove_group":
        await this.handleDocumentGroupEvent(subscription, event);
        return;
      case "documents.update.delayed":
      case "documents.update.debounced":
      case "documents.empty_trash":
        // Ignored
        return;
      case "revisions.create":
        await this.handleRevisionEvent(subscription, event);
        return;
      case "fileOperations.create":
      case "fileOperations.update":
      case "fileOperations.delete":
        await this.handleFileOperationEvent(subscription, event);
        return;
      case "collections.create":
      case "collections.update":
      case "collections.delete":
      case "collections.move":
      case "collections.permission_changed":
      case "collections.archive":
      case "collections.restore":
        await this.handleCollectionEvent(subscription, event);
        return;
      case "collections.add_user":
      case "collections.remove_user":
        await this.handleCollectionUserEvent(subscription, event);
        return;
      case "collections.add_group":
      case "collections.remove_group":
        await this.handleCollectionGroupEvent(subscription, event);
        return;
      case "comments.create":
      case "comments.update":
      case "comments.delete":
        await this.handleCommentEvent(subscription, event);
        return;
      case "comments.add_reaction":
      case "comments.remove_reaction":
        // Ignored
        return;
      case "groups.create":
      case "groups.update":
      case "groups.delete":
        await this.handleGroupEvent(subscription, event);
        return;
      case "groups.add_user":
      case "groups.remove_user":
        await this.handleGroupUserEvent(subscription, event);
        return;
      case "integrations.create":
      case "integrations.update":
      case "integrations.delete":
        await this.handleIntegrationEvent(subscription, event);
        return;
      case "teams.create":
      case "teams.delete":
      case "teams.destroy":
        // Ignored
        return;
      case "teams.update":
        await this.handleTeamEvent(subscription, event);
        return;
      case "pins.create":
      case "pins.update":
      case "pins.delete":
        await this.handlePinEvent(subscription, event);
        return;
      case "stars.create":
      case "stars.update":
      case "stars.delete":
        await this.handleStarEvent(subscription, event);
        return;
      case "shares.create":
      case "shares.update":
      case "shares.revoke":
        await this.handleShareEvent(subscription, event);
        return;
      case "webhookSubscriptions.create":
      case "webhookSubscriptions.delete":
      case "webhookSubscriptions.update":
        await this.handleWebhookSubscriptionEvent(subscription, event);
        return;
      case "views.create":
        await this.handleViewEvent(subscription, event);
        return;
      case "userMemberships.update":
        // Ignored
        return;
      case "imports.create":
      case "imports.update":
      case "imports.processed":
      case "imports.delete":
        // Ignored
        return;
      case "oauthClients.create":
      case "oauthClients.update":
      case "oauthClients.delete":
        // Ignored
        return;
      case "templates.create":
      case "templates.update":
      case "templates.delete":
      case "templates.restore":
      case "passkeys.create":
      case "passkeys.update":
      case "passkeys.delete":
        // Ignored
        return;
      default:
        assertUnreachable(event);
    }
  }
  async handleAttachmentEvent(subscription, event) {
    const model = await _models.Attachment.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentAttachment)(model)
      }
    });
  }
  async handleWebhookSubscriptionEvent(subscription, event) {
    const model = await _models.WebhookSubscription.findByPk(event.modelId, {
      paranoid: false
    });
    let data = null;
    if (model) {
      data = {
        ...(0, _webhookSubscription.default)(model),
        secret: undefined
      };
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: data
      }
    });
  }
  async handleViewEvent(subscription, event) {
    const model = await _models.View.scope("withUser").findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentView)(model)
      }
    });
  }
  async handleStarEvent(subscription, event) {
    const model = await _models.Star.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentStar)(model)
      }
    });
  }
  async handleShareEvent(subscription, event) {
    const model = await _models.Share.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentShare)(model)
      }
    });
  }
  async handleCommentEvent(subscription, event) {
    const model = await _models.Comment.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentComment)(model)
      }
    });
  }
  async handlePinEvent(subscription, event) {
    const model = await _models.Pin.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentPin)(model)
      }
    });
  }
  async handleTeamEvent(subscription, event) {
    const model = await _models.Team.scope("withDomains").findByPk(event.teamId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.teamId,
        model: model && (0, _presenters.presentTeam)(model)
      }
    });
  }
  async handleIntegrationEvent(subscription, event) {
    const model = await _models.Integration.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentIntegration)(model)
      }
    });
  }
  async handleGroupEvent(subscription, event) {
    const model = await _models.Group.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (await (0, _presenters.presentGroup)(model))
      }
    });
  }
  async handleGroupUserEvent(subscription, event) {
    const model = await _models.GroupUser.scope(["withUser", "withGroup"]).findOne({
      where: {
        groupId: event.modelId,
        userId: event.userId
      },
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: `${event.userId}-${event.modelId}`,
        model: model && (0, _presenters.presentGroupUser)(model),
        group: model && (await (0, _presenters.presentGroup)(model.group)),
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleCollectionEvent(subscription, event) {
    const model = await _models.Collection.findByPk(event.collectionId, {
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.collectionId,
        model: collection
      }
    });
  }
  async handleCollectionUserEvent(subscription, event) {
    const model = await _models.UserMembership.scope(["withUser", "withCollection"]).findOne({
      where: {
        collectionId: event.collectionId,
        userId: event.userId
      },
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model.collection));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentMembership)(model),
        collection,
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleCollectionGroupEvent(subscription, event) {
    const model = await _models.GroupMembership.scope(["withGroup", "withCollection"]).findOne({
      where: {
        collectionId: event.collectionId,
        groupId: event.modelId
      },
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model.collection));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentGroupMembership)(model),
        collection,
        group: model && (await (0, _presenters.presentGroup)(model.group))
      }
    });
  }
  async handleFileOperationEvent(subscription, event) {
    const model = await _models.FileOperation.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentFileOperation)(model)
      }
    });
  }
  async handleDocumentEvent(subscription, event) {
    const model = await _models.Document.findByPk(event.documentId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.documentId,
        model: model && (await (0, _presenters.presentDocument)(undefined, model, {
          includeData: true,
          includeText: true
        }))
      }
    });
  }
  async handleDocumentUserEvent(subscription, event) {
    const model = await _models.UserMembership.scope(["withUser", "withDocument"]).findOne({
      where: {
        documentId: event.documentId,
        userId: event.userId
      },
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentMembership)(model),
        document: model && (await (0, _presenters.presentDocument)(undefined, model.document, {
          includeData: true,
          includeText: true
        })),
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleDocumentGroupEvent(subscription, event) {
    const model = await _models.GroupMembership.scope(["withGroup", "withDocument"]).findOne({
      where: {
        documentId: event.documentId,
        groupId: event.modelId
      },
      paranoid: false
    });
    const document = model && (await (0, _presenters.presentDocument)(undefined, model.document));
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentGroupMembership)(model),
        document,
        group: model && (await (0, _presenters.presentGroup)(model.group))
      }
    });
  }
  async handleRevisionEvent(subscription, event) {
    const [model, document] = await Promise.all([_models.Revision.findByPk(event.modelId, {
      paranoid: false
    }), _models.Document.findByPk(event.documentId, {
      paranoid: false
    })]);
    const data = {
      ...(model ? await (0, _presenters.presentRevision)(model) : {}),
      collectionId: document ? document.collectionId : undefined
    };
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: data
      }
    });
  }
  async handleUserEvent(subscription, event) {
    const model = await _models.User.findByPk(event.userId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.userId,
        model: model && (0, _presenters.presentUser)(model)
      }
    });
  }

  /** Maximum number of bytes to read from webhook response bodies. */

  async sendWebhook(_ref2) {
    let {
      event,
      subscription,
      payload
    } = _ref2;
    const delivery = await _models.WebhookDelivery.create({
      webhookSubscriptionId: subscription.id,
      status: "pending"
    });
    let response;
    let requestBody, requestHeaders;
    let status;
    let responseBody = "";
    try {
      requestBody = (0, _webhook.default)({
        event,
        delivery,
        payload
      });
      requestHeaders = {
        "Content-Type": "application/json"
      };
      const signature = subscription.signature(JSON.stringify(requestBody));
      if (signature) {
        requestHeaders["Outline-Signature"] = signature;
      }
      response = await (0, _fetch.default)(subscription.url, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        redirect: "error",
        timeout: 5000
      });
      status = response.ok ? "success" : "failed";
    } catch (err) {
      const error = (0, _error.toError)(err);
      if (isExpectedNetworkError(err) && _env.default.isCloudHosted) {
        _Logger.default.warn(`Failed to send webhook: ${error.message}`, {
          event,
          deliveryId: delivery.id
        });
      } else {
        _Logger.default.error("Failed to send webhook", error, {
          event,
          deliveryId: delivery.id
        });
      }
      status = "failed";
    }
    if (response) {
      try {
        // TODO: Use stream to avoid buffering large responses in memory.
        const text = await response.text();
        responseBody = text.slice(0, DeliverWebhookTask.MAX_RESPONSE_BODY_SIZE);
      } catch (err) {
        _Logger.default.debug("task", `Failed to read webhook response body: ${err.message}`);
      }
    }
    await delivery.update({
      status,
      statusCode: response ? response.status : null,
      requestBody,
      requestHeaders,
      responseBody,
      responseHeaders: response ? Object.fromEntries(response.headers.entries()) : {}
    });
    if (status === "failed") {
      try {
        await this.checkAndDisableSubscription(subscription);
      } catch (err) {
        _Logger.default.error("Failed to check and disable recent deliveries", (0, _error.toError)(err), {
          event,
          deliveryId: delivery.id
        });
      }
    }
  }
  async checkAndDisableSubscription(subscription) {
    // Calculate the time window for analysis
    const timeWindowSeconds = _env.default.WEBHOOK_FAILURE_TIME_WINDOW;
    const failureRateThreshold = _env.default.WEBHOOK_FAILURE_RATE_THRESHOLD;
    const timeWindowStart = new Date(Date.now() - timeWindowSeconds * 1000);

    // Get all deliveries within the time window
    const deliveriesInWindow = await _models.WebhookDelivery.findAll({
      where: {
        webhookSubscriptionId: subscription.id,
        createdAt: {
          [_sequelize.Op.gte]: timeWindowStart
        }
      },
      order: [["createdAt", "DESC"]]
    });

    // If there are no deliveries in the time window, don't disable
    if (deliveriesInWindow.length === 0) {
      return;
    }

    // Calculate failure rate
    const failedDeliveries = deliveriesInWindow.filter(delivery => delivery.status === "failed");
    const failureRate = failedDeliveries.length / deliveriesInWindow.length * 100;

    // Only log analysis if there are failures to report
    if (failedDeliveries.length > 0) {
      _Logger.default.info("task", "Webhook failure analysis", {
        subscriptionId: subscription.id,
        timeWindowSeconds,
        totalDeliveries: deliveriesInWindow.length,
        failedDeliveries: failedDeliveries.length,
        failureRate: Math.round(failureRate * 100) / 100,
        threshold: failureRateThreshold
      });
    }

    // Check if failure rate exceeds threshold and we have enough data points
    if (failureRate >= failureRateThreshold && deliveriesInWindow.length >= DeliverWebhookTask.MIN_DELIVERIES_FOR_ANALYSIS) {
      _Logger.default.warn("Disabling webhook due to high failure rate", {
        subscriptionId: subscription.id,
        failureRate: Math.round(failureRate * 100) / 100,
        threshold: failureRateThreshold,
        timeWindowSeconds,
        totalDeliveries: deliveriesInWindow.length,
        failedDeliveries: failedDeliveries.length
      });

      // Disable the subscription
      await subscription.disable();

      // Send an email to the creator of the webhook to let them know
      const [createdBy, team] = await Promise.all([_models.User.findOne({
        where: {
          id: subscription.createdById,
          suspendedAt: {
            [_sequelize.Op.is]: null
          }
        }
      }), subscription.$get("team")]);
      if (createdBy && team) {
        await new _WebhookDisabledEmail.default({
          to: createdBy.email,
          language: createdBy.language,
          teamUrl: team.url,
          webhookName: subscription.name
        }).schedule();
      }
    }
  }
}
exports.default = DeliverWebhookTask;
// Minimum number of deliveries required in time window before considering disabling
_defineProperty(DeliverWebhookTask, "MIN_DELIVERIES_FOR_ANALYSIS", 10);
_defineProperty(DeliverWebhookTask, "MAX_RESPONSE_BODY_SIZE", 1024);