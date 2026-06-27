"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _NotificationSettingsHelper = _interopRequireDefault(require("../../models/helpers/NotificationSettingsHelper"));
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _policies = require("../../policies");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const MAX_SUBJECT_CONTENT = 50;
/**
 * Email sent to a user when a new comment is created in a document they are
 * subscribed to.
 */
class CommentCreatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    const {
      documentId,
      commentId
    } = props;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const [comment, team, collection] = await Promise.all([_models.Comment.findByPk(commentId), document.$get("team"), document.$get("collection")]);
    if (!comment || !team) {
      return false;
    }
    const parentComment = comment.parentCommentId ? (await comment.$get("parentComment")) ?? undefined : undefined;
    const body = await this.htmlForData(team, _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data));
    const isReply = !!comment.parentCommentId;
    return {
      comment,
      parentComment,
      document,
      collection,
      isReply,
      body,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.CreateComment);
  }
  subject(_ref2) {
    let {
      comment,
      parentComment,
      document
    } = _ref2;
    const commentText = _DocumentHelper.DocumentHelper.toPlainText(parentComment?.data ?? comment.data);
    const trimmedText = commentText.length <= MAX_SUBJECT_CONTENT ? commentText : `${commentText.slice(0, MAX_SUBJECT_CONTENT)}...`;
    return `${parentComment ? this.t("Re") + ": " : ""}${this.t("New comment on “{{ documentTitle }}” - {{ trimmedText }}", {
      documentTitle: document.titleWithDefault,
      trimmedText
    })}`;
  }
  preview(_ref3) {
    let {
      isReply,
      actorName
    } = _ref3;
    return isReply ? this.t("{{ actorName }} replied in a thread", {
      actorName
    }) : this.t("{{ actorName }} commented on the document", {
      actorName
    });
  }
  fromName(_ref4) {
    let {
      actorName
    } = _ref4;
    return actorName;
  }
  replyTo(_ref5) {
    let {
      notification
    } = _ref5;
    if (notification?.user && notification.actor?.email) {
      if ((0, _policies.can)(notification.user, "readEmail", notification.actor)) {
        return notification.actor.email;
      }
    }
    return;
  }
  renderAsText(_ref6) {
    let {
      actorName,
      teamUrl,
      isReply,
      document,
      commentId,
      collection
    } = _ref6;
    const action = isReply ? this.t("{{ actorName }} replied to a thread in “{{ documentTitle }}”", {
      actorName,
      documentTitle: document.titleWithDefault
    }) : this.t("{{ actorName }} commented on “{{ documentTitle }}”", {
      actorName,
      documentTitle: document.titleWithDefault
    });
    const inCollection = collection?.name ? ` ${this.t("in the {{ collectionName }} collection", {
      collectionName: collection.name
    })}` : "";
    return `
${action}${inCollection}.

${this.t("Open Thread")}: ${teamUrl}${document.url}?commentId=${commentId}
`;
  }
  render(props) {
    const {
      document,
      actorName,
      isReply,
      collection,
      teamUrl,
      commentId,
      unsubscribeUrl,
      body
    } = props;
    const threadLink = `${teamUrl}${document.url}?commentId=${commentId}&ref=notification-email`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: threadLink,
        name: this.t("View Thread")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: document.titleWithDefault
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [isReply ? this.t("{{ actorName }} replied to a thread in", {
            actorName
          }) : this.t("{{ actorName }} commented on", {
            actorName
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: threadLink,
            children: document.titleWithDefault
          }), " ", collection?.name ? this.t("in the {{ collectionName }} collection", {
            collectionName: collection.name
          }) : "", "."]
        }), body && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
            height: 20
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Diff.default, {
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              dangerouslySetInnerHTML: {
                __html: body
              }
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
            height: 20
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: threadLink,
            children: this.t("Open Thread")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails")
      })]
    });
  }
}
exports.default = CommentCreatedEmail;