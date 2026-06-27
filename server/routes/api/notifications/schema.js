"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationsUpdateSchema = exports.NotificationsUpdateAllSchema = exports.NotificationsUnsubscribeSchema = exports.NotificationsPixelSchema = exports.NotificationsListSchema = exports.NotificationSettingsDeleteSchema = exports.NotificationSettingsCreateSchema = void 0;
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _schema = require("../schema");
const NotificationSettingsCreateSchema = exports.NotificationSettingsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.enum(_types.NotificationEventType)
  })
});
const NotificationSettingsDeleteSchema = exports.NotificationSettingsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.enum(_types.NotificationEventType)
  })
});
const NotificationsUnsubscribeSchema = exports.NotificationsUnsubscribeSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    userId: _zod.z.uuid().optional(),
    token: _zod.z.string().optional(),
    eventType: _zod.z.enum(_types.NotificationEventType).optional()
  }),
  query: _zod.z.object({
    follow: _zod.z.string().prefault(""),
    userId: _zod.z.uuid().optional(),
    token: _zod.z.string().optional(),
    eventType: _zod.z.enum(_types.NotificationEventType).optional()
  })
}).refine(req => !((0, _compat.isEmpty)(req.body.userId) && (0, _compat.isEmpty)(req.query.userId)), {
  message: "userId is required"
});
const NotificationsListSchema = exports.NotificationsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.enum(_types.NotificationEventType).nullish(),
    archived: _zod.z.boolean().nullish()
  })
});
const NotificationsUpdateSchema = exports.NotificationsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    viewedAt: _zod.z.coerce.date().nullish(),
    archivedAt: _zod.z.coerce.date().nullish()
  })
});
const NotificationsUpdateAllSchema = exports.NotificationsUpdateAllSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    viewedAt: _zod.z.coerce.date().nullish(),
    archivedAt: _zod.z.coerce.date().nullish()
  })
});
const NotificationsPixelSchema = exports.NotificationsPixelSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    id: _zod.z.uuid(),
    token: _zod.z.string()
  })
});