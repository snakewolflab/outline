"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _policies = require("../../policies");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to a user when they are a member of a group mentioned in a document.
 */
class GroupDocumentMentionedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      documentId,
      revisionId,
      groupId
    } = _ref;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const group = await _models.Group.findByPk(groupId);
    if (!group) {
      return false;
    }
    const team = await document.$get("team");
    if (!team) {
      return false;
    }
    let currDoc = document;
    let prevDoc;
    if (revisionId) {
      const revision = await _models.Revision.findByPk(revisionId);
      if (!revision) {
        return false;
      }
      currDoc = revision;
      prevDoc = (await revision.before()) ?? undefined;
    }
    const currMentions = _DocumentHelper.DocumentHelper.parseMentions(currDoc, {
      type: _types.MentionType.Group,
      modelId: groupId
    });
    const prevMentions = prevDoc ? _DocumentHelper.DocumentHelper.parseMentions(prevDoc, {
      type: _types.MentionType.Group,
      modelId: groupId
    }) : [];
    const firstNewMention = (0, _compat.differenceBy)(currMentions, prevMentions, "id")[0];
    let body;
    if (firstNewMention) {
      const node = _ProsemirrorHelper.ProsemirrorHelper.getNodeForMentionEmail(_DocumentHelper.DocumentHelper.toProsemirror(currDoc), firstNewMention);
      if (node) {
        body = await this.htmlForData(team, node);
      }
    }
    return {
      document,
      body,
      groupName: group.name
    };
  }
  subject(_ref2) {
    let {
      document,
      groupName
    } = _ref2;
    return this.t(`The {{ groupName }} group was mentioned in “{{ documentTitle }}”`, {
      groupName,
      documentTitle: document.titleWithDefault
    });
  }
  preview(_ref3) {
    let {
      actorName,
      groupName
    } = _ref3;
    return this.t(`{{ actorName }} mentioned the “{{ groupName }}” group`, {
      actorName,
      groupName
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
      groupName
    } = _ref6;
    return `
${this.t(`{{ actorName }} mentioned the “{{ groupName }}” group in the document “{{ documentTitle }}”.`, {
      actorName,
      groupName,
      documentTitle: document.titleWithDefault
    })}

${this.t("Open Document")}: ${teamUrl}${document.url}
`;
  }
  render(props) {
    const {
      document,
      actorName,
      teamUrl,
      body,
      groupName
    } = props;
    const documentLink = `${teamUrl}${document.url}?ref=notification-email`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentLink,
        name: this.t("View Document")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Your group was mentioned")
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t(`{{ actorName }} mentioned the "{{ groupName }}" group in the document`, {
            actorName,
            groupName
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: documentLink,
            children: document.titleWithDefault
          }), "."]
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
      })]
    });
  }
}
exports.default = GroupDocumentMentionedEmail;