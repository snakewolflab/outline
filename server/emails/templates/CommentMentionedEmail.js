"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _models = require("../../models");
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
/**
 * Email sent to a user when they are mentioned in a comment.
 */
class CommentMentionedEmail extends _BaseEmail.default {
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
    const collection = await document.$get("collection");
    if (!collection) {
      return false;
    }
    const [comment, team] = await Promise.all([_models.Comment.findByPk(commentId), document.$get("team")]);
    if (!comment || !team) {
      return false;
    }
    const body = await this.htmlForData(team, _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data));
    return {
      document,
      collection,
      body,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.MentionedInComment);
  }
  replyTo(_ref2) {
    let {
      notification
    } = _ref2;
    if (notification?.user && notification.actor?.email) {
      if ((0, _policies.can)(notification.user, "readEmail", notification.actor)) {
        return notification.actor.email;
      }
    }
    return;
  }
  subject(_ref3) {
    let {
      document
    } = _ref3;
    return this.t("Mentioned you in “{{ documentTitle }}”", {
      documentTitle: document.titleWithDefault
    });
  }
  preview(_ref4) {
    let {
      actorName
    } = _ref4;
    return this.t("{{ actorName }} mentioned you in a thread", {
      actorName
    });
  }
  fromName(_ref5) {
    let {
      actorName
    } = _ref5;
    return actorName;
  }
  renderAsText(_ref6) {
    let {
      actorName,
      teamUrl,
      document,
      commentId,
      collection
    } = _ref6;
    const action = this.t("{{ actorName }} mentioned you in a comment on “{{ documentTitle }}”", {
      actorName,
      documentTitle: document.titleWithDefault
    });
    const inCollection = collection.name ? ` ${this.t("in the {{ collectionName }} collection", {
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
      collection,
      actorName,
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
          children: [this.t("{{ actorName }} mentioned you in a comment on", {
            actorName
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: threadLink,
            children: document.titleWithDefault
          }), " ", collection.name ? this.t("in the {{ collectionName }} collection", {
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
exports.default = CommentMentionedEmail;