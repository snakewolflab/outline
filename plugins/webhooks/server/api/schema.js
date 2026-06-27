"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebhookSubscriptionsUpdateSchema = exports.WebhookSubscriptionsListSchema = exports.WebhookSubscriptionsDeleteSchema = exports.WebhookSubscriptionsCreateSchema = void 0;
var _zod = require("zod");
var _validations = require("../../../../shared/validations");
var _env = _interopRequireDefault(require("../../../../server/env"));
var _models = require("../../../../server/models");
var _schema = require("../../../../server/routes/api/schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const webhookUrl = _zod.z.url().max(_validations.WebhookSubscriptionValidation.maxUrlLength, {
  error: `Webhook url must be ${_validations.WebhookSubscriptionValidation.maxUrlLength} characters or less`
}).refine(val => !_env.default.isCloudHosted || val.startsWith("https://"), {
  error: "Webhook url must use https"
});
const WebhookSubscriptionsListSchema = exports.WebhookSubscriptionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Webhook subscriptions sorting direction */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    /** Webhook subscriptions sorting column */
    sort: _zod.z.string().refine(val => Object.keys(_models.WebhookSubscription.getAttributes()).includes(val), {
      error: "Invalid sort parameter"
    }).prefault("createdAt"),
    /** Search query to filter webhook subscriptions by name */
    query: _zod.z.string().optional()
  })
});
const WebhookSubscriptionsCreateSchema = exports.WebhookSubscriptionsCreateSchema = _zod.z.object({
  body: _zod.z.object({
    name: _zod.z.string(),
    url: webhookUrl,
    secret: _zod.z.string().optional(),
    events: _zod.z.array(_zod.z.string())
  })
});
const WebhookSubscriptionsUpdateSchema = exports.WebhookSubscriptionsUpdateSchema = _zod.z.object({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    name: _zod.z.string(),
    url: webhookUrl,
    secret: _zod.z.string().optional(),
    events: _zod.z.array(_zod.z.string())
  })
});
const WebhookSubscriptionsDeleteSchema = exports.WebhookSubscriptionsDeleteSchema = _zod.z.object({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});