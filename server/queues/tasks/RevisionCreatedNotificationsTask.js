"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _subscriptionCreator = require("../../commands/subscriptionCreator");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _NotificationHelper = _interopRequireDefault(require("../../models/helpers/NotificationHelper"));
var _permissions = require("../../utils/permissions");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class RevisionCreatedNotificationsTask extends _BaseTask.BaseTask {
  constructor() {
    super(...arguments);
    _defineProperty(this, "shouldNotify", async (document, user) => {
      // Create only a single notification in a 6 hour window
      const notification = await _models.Notification.findOne({
        order: [["createdAt", "DESC"]],
        where: {
          userId: user.id,
          documentId: document.id,
          emailedAt: {
            [_sequelize.Op.not]: null,
            [_sequelize.Op.gte]: (0, _dateFns.subHours)(new Date(), 6)
          }
        }
      });
      if (notification) {
        if (_env.default.isDevelopment) {
          _Logger.default.info("processor", `would have suppressed notification to ${user.id}, but not in development`);
        } else {
          _Logger.default.info("processor", `suppressing notification to ${user.id} as recently notified`);
          return false;
        }
      }

      // If this recipient has viewed the document since the last update was made
      // then we can avoid sending them a useless notification, yay.
      const view = await _models.View.findOne({
        where: {
          userId: user.id,
          documentId: document.id,
          updatedAt: {
            [_sequelize.Op.gt]: document.updatedAt
          }
        }
      });
      if (view) {
        _Logger.default.info("processor", `suppressing notification to ${user.id} because update viewed`);
        return false;
      }
      return true;
    });
  }
  async perform(event) {
    const [document, revision] = await Promise.all([_models.Document.findByPk(event.documentId, {
      includeState: true
    }), _models.Revision.findByPk(event.modelId)]);
    if (!document || !revision) {
      return;
    }
    await (0, _subscriptionCreator.createSubscriptionsForDocument)(document, event);
    const before = await revision.before();

    // Send notifications to mentioned users first – these must be processed
    // regardless of the change threshold as even a small edit can add a mention.
    const oldMentions = before ? [..._DocumentHelper.DocumentHelper.parseMentions(before, {
      type: _types.MentionType.User
    })] : [];
    const newMentions = [..._DocumentHelper.DocumentHelper.parseMentions(document, {
      type: _types.MentionType.User
    })];
    const mentions = (0, _compat.differenceBy)(newMentions, oldMentions, "id");
    const userIdsProcessed = new Set();
    const userIdsMentioned = [];
    const usersToSubscribe = [];
    for (const mention of mentions) {
      if (userIdsProcessed.has(mention.modelId)) {
        continue;
      }
      userIdsProcessed.add(mention.modelId);
      const recipient = await _models.User.findByPk(mention.modelId);
      if (!recipient || recipient.id === mention.actorId || !(await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
        continue;
      }
      usersToSubscribe.push(recipient);
      if (recipient.subscribedToEventType(_types.NotificationEventType.MentionedInDocument)) {
        await _models.Notification.create({
          event: _types.NotificationEventType.MentionedInDocument,
          userId: recipient.id,
          revisionId: event.modelId,
          actorId: mention.actorId,
          teamId: document.teamId,
          documentId: document.id
        });
        userIdsMentioned.push(recipient.id);
      }
    }
    await (0, _subscriptionCreator.subscribeUsersToDocument)(usersToSubscribe, document, event);

    // Send notifications to users in mentioned groups
    const oldGroupMentions = before ? _DocumentHelper.DocumentHelper.parseMentions(before, {
      type: _types.MentionType.Group
    }) : [];
    const newGroupMentions = _DocumentHelper.DocumentHelper.parseMentions(document, {
      type: _types.MentionType.Group
    });
    const groupMentions = (0, _compat.differenceBy)(newGroupMentions, oldGroupMentions, "id");
    const mentionedGroup = [];
    for (const group of groupMentions) {
      if (mentionedGroup.includes(group.modelId)) {
        continue;
      }

      // Check if the group has mentions disabled
      const groupModel = await _models.Group.findByPk(group.modelId);
      if (groupModel?.disableMentions) {
        continue;
      }
      const usersFromMentionedGroup = await _models.GroupUser.findAll({
        where: {
          groupId: group.modelId
        },
        order: [["permission", "ASC"]]
      });
      const mentionedUser = [];
      for (const user of usersFromMentionedGroup) {
        if (mentionedUser.includes(user.userId)) {
          continue;
        }
        const recipient = await _models.User.findByPk(user.userId);
        if (recipient && recipient.id !== group.actorId && recipient.subscribedToEventType(_types.NotificationEventType.GroupMentionedInDocument) && (await (0, _permissions.canUserAccessDocument)(recipient, document.id))) {
          await _models.Notification.create({
            event: _types.NotificationEventType.GroupMentionedInDocument,
            groupId: group.modelId,
            userId: recipient.id,
            revisionId: event.modelId,
            actorId: group.actorId,
            teamId: document.teamId,
            documentId: document.id
          });
          mentionedUser.push(user.userId);
        }
      }
      mentionedGroup.push(group.modelId);
    }

    // If the content change is insignificant, don't send generic update
    // notifications (mention notifications above are still sent).
    if (!_DocumentHelper.DocumentHelper.isChangeOverThreshold(before, revision, 5)) {
      _Logger.default.info("processor", `suppressing update notifications as change has insignificant edits`);
      return;
    }
    const recipients = (await _NotificationHelper.default.getDocumentNotificationRecipients({
      document,
      notificationType: _types.NotificationEventType.UpdateDocument,
      actorId: document.lastModifiedById
    })).filter(recipient => !userIdsMentioned.includes(recipient.id));
    if (!recipients.length) {
      return;
    }
    for (const recipient of recipients) {
      const notify = await this.shouldNotify(document, recipient);
      if (notify) {
        await _models.Notification.create({
          event: _types.NotificationEventType.UpdateDocument,
          userId: recipient.id,
          revisionId: event.modelId,
          actorId: document.updatedBy.id,
          teamId: document.teamId,
          documentId: document.id
        });
      }
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = RevisionCreatedNotificationsTask;