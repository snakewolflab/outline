"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _ = require("./..");
var _permissions = require("../../utils/permissions");
var _ProsemirrorHelper = require("./ProsemirrorHelper");
var _NotificationHelper;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class NotificationHelper {}
exports.default = NotificationHelper;
_NotificationHelper = NotificationHelper;
/**
 * Get the recipients of a notification for a collection event.
 *
 * @param collection The collection to get recipients for
 * @param eventType The event type
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getCollectionNotificationRecipients", async (collection, eventType) => {
  // Find all the users that have notifications enabled for this event
  // type at all and aren't the one that performed the action.
  let recipients = await _.User.findAll({
    where: {
      id: {
        [_sequelize.Op.ne]: collection.createdById
      },
      teamId: collection.teamId
    }
  });
  recipients = recipients.filter(recipient => recipient.subscribedToEventType(eventType));
  return recipients;
});
/**
 * Get the recipients of a notification for a comment event.
 *
 * @param document The document associated with the comment
 * @param comment The comment to get recipients for
 * @param actorId The creator of the comment
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getCommentNotificationRecipients", async (document, comment, actorId) => {
  let recipients;

  // If this is a reply to another comment, we want to notify all users
  // that are involved in the thread of this comment (i.e. the original
  // comment and all replies to it).
  if (comment.parentCommentId) {
    const contextComments = await _.Comment.findAll({
      attributes: ["createdById", "data"],
      where: {
        [_sequelize.Op.or]: [{
          id: comment.parentCommentId
        }, {
          parentCommentId: comment.parentCommentId
        }]
      }
    });
    const createdUserIdsInThread = contextComments.map(c => c.createdById);
    const mentionedUserIdsInThread = contextComments.flatMap(c => _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(c.data), {
      type: _types.MentionType.User
    })).map(mention => mention.modelId);
    const userIdsInThread = (0, _compat.uniq)([...createdUserIdsInThread, ...mentionedUserIdsInThread]).filter(userId => userId !== actorId);
    recipients = await _.User.findAll({
      where: {
        id: {
          [_sequelize.Op.in]: userIdsInThread
        },
        teamId: document.teamId
      }
    });
    recipients = recipients.filter(recipient => recipient.subscribedToEventType(_types.NotificationEventType.CreateComment));
  } else {
    recipients = await _NotificationHelper.getDocumentNotificationRecipients({
      document,
      notificationType: _types.NotificationEventType.CreateComment,
      actorId,
      // We will check below, this just prevents duplicate queries
      disableAccessCheck: true
    });
  }
  const filtered = [];
  for (const recipient of recipients) {
    if (recipient.isSuspended) {
      continue;
    }

    // If this recipient has viewed the document since the comment was made
    // then we can avoid sending them a useless notification, yay.
    const view = await _.View.findOne({
      where: {
        userId: recipient.id,
        documentId: document.id,
        updatedAt: {
          [_sequelize.Op.gt]: comment.createdAt
        }
      }
    });
    if (view) {
      _Logger.default.info("processor", `suppressing notification to ${recipient.id} because doc viewed`);
      continue;
    }

    // Check the recipient has access to the collection this document is in. Just
    // because they are subscribed doesn't mean they still have access to read
    // the document.
    if (await (0, _permissions.canUserAccessDocument)(recipient, document.id)) {
      filtered.push(recipient);
    }
  }
  return filtered;
});
/**
 * Get the recipients of a notification for a document event.
 *
 * @param document The document to get recipients for.
 * @param notificationType The notification type for which to find the recipients.
 * @param actorId The id of the user that performed the action.
 * @param disableAccessCheck Whether to disable the access check for the document.
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getDocumentNotificationRecipients", async _ref => {
  let {
    document,
    notificationType,
    actorId,
    disableAccessCheck = false
  } = _ref;
  let recipients;
  if (notificationType === _types.NotificationEventType.PublishDocument) {
    recipients = await _.User.findAll({
      where: {
        id: {
          [_sequelize.Op.ne]: actorId
        },
        teamId: document.teamId,
        notificationSettings: {
          [notificationType]: true
        }
      }
    });
  } else {
    const userFilter = {
      userId: {
        [_sequelize.Op.ne]: actorId
      }
    };
    const userInclude = [{
      association: "user",
      required: true
    }];
    const [collectionSubs, documentSubs] = await Promise.all([document.collectionId ? _.Subscription.findAll({
      where: {
        ...userFilter,
        event: _types.SubscriptionType.Document,
        collectionId: document.collectionId
      },
      include: userInclude
    }) : [], _.Subscription.findAll({
      where: {
        ...userFilter,
        event: _types.SubscriptionType.Document,
        documentId: document.id
      },
      include: userInclude
    })]);
    recipients = (0, _compat.uniqBy)([...collectionSubs, ...documentSubs].map(s => s.user), user => user.id);
  }
  const filtered = [];
  for (const recipient of recipients) {
    if (recipient.isSuspended || !recipient.subscribedToEventType(notificationType)) {
      continue;
    }

    // Check the recipient has access to the collection this document is in. Just
    // because they are subscribed doesn't mean they still have access to read
    // the document.
    if (disableAccessCheck || (await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
      filtered.push(recipient);
    }
  }
  return filtered;
});