"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _time = require("../../../shared/utils/time");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _HTMLHelper = _interopRequireDefault(require("../../models/helpers/HTMLHelper"));
var _NotificationSettingsHelper = _interopRequireDefault(require("../../models/helpers/NotificationSettingsHelper"));
var _SubscriptionHelper = _interopRequireDefault(require("../../models/helpers/SubscriptionHelper"));
var _policies = require("../../policies");
var _CacheHelper = require("../../utils/CacheHelper");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireWildcard(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to a user when they have enabled document notifications, the event
 * may be published or updated.
 */
class DocumentPublishedOrUpdatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    const {
      documentId,
      revisionId
    } = props;
    const document = await _models.Document.unscoped().findByPk(documentId, {
      includeState: true
    });
    if (!document) {
      return false;
    }
    const [collection, team] = await Promise.all([document.$get("collection"), document.$get("team")]);
    let body;
    if (revisionId && team?.getPreference(_types.TeamPreference.PreviewsInEmails)) {
      body = await _CacheHelper.CacheHelper.getDataOrSet(`diff:${revisionId}`, async () => {
        // generate the diff html for the email
        const revision = await _models.Revision.findByPk(revisionId);
        if (revision) {
          const before = await revision.before();
          const content = await _DocumentHelper.DocumentHelper.toEmailDiff(before, revision, {
            includeTitle: false,
            centered: false,
            signedUrls: 4 * _time.Day.seconds,
            baseUrl: props.teamUrl
          });

          // inline all css so that it works in as many email providers as possible.
          return content ? await _HTMLHelper.default.inlineCSS(content) : undefined;
        }
        return;
      }, 30, 10000);
    }
    return {
      document,
      collection,
      body,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId,
      eventType
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, eventType);
  }
  eventName(eventType) {
    switch (eventType) {
      case _types.NotificationEventType.PublishDocument:
        return this.t("published");
      case _types.NotificationEventType.UpdateDocument:
        return this.t("updated");
      default:
        return "";
    }
  }
  subject(_ref2) {
    let {
      document,
      eventType
    } = _ref2;
    return this.t(`“{{ documentTitle }}” {{ eventName }}`, {
      documentTitle: document.titleWithDefault,
      eventName: this.eventName(eventType)
    });
  }
  preview(_ref3) {
    let {
      actorName,
      eventType
    } = _ref3;
    return this.t("{{ actorName }} {{ eventName }} a document", {
      actorName,
      eventName: this.eventName(eventType)
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
      document,
      collection,
      eventType
    } = _ref6;
    const eventName = this.eventName(eventType);
    return `
${this.t(`"{{ documentTitle }}" {{ eventName }}`, {
      documentTitle: document.titleWithDefault,
      eventName
    })}

${this.t(`{{ actorName }} {{ eventName }} the document "{{ documentTitle }}"`, {
      actorName,
      eventName,
      documentTitle: document.titleWithDefault
    })}${collection?.name ? `, ${this.t("in the {{ collectionName }} collection", {
      collectionName: collection.name
    })}` : ""}.

${this.t("Open Document")}: ${teamUrl}${document.url}
`;
  }
  render(props) {
    const {
      document,
      actorName,
      collection,
      eventType,
      teamUrl,
      unsubscribeUrl,
      body
    } = props;
    const documentLink = `${teamUrl}${document.url}?ref=notification-email`;
    const eventName = this.eventName(eventType);
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentLink,
        name: this.t("View Document")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t(`“{{ documentTitle }}” {{ eventName }}`, {
            documentTitle: document.titleWithDefault,
            eventName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("{{ actorName }} {{ eventName }} the document", {
            actorName,
            eventName
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: documentLink,
            children: document.titleWithDefault
          }), collection?.name ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
            children: [",", " ", this.t("in the {{ collectionName }} collection", {
              collectionName: collection.name
            })]
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
            href: documentLink,
            children: this.t("Open Document")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails"),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.Link, {
          href: _SubscriptionHelper.default.unsubscribeUrl(props.userId, props.documentId),
          children: this.t("Unsubscribe from this doc")
        })
      })]
    });
  }
}
exports.default = DocumentPublishedOrUpdatedEmail;