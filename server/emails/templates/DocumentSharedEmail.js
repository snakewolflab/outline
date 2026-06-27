"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _models = require("../../models");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to a user when someone adds them to a document.
 */
class DocumentSharedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      documentId,
      membershipId
    } = _ref;
    if (!membershipId) {
      return false;
    }
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const membership = (await _models.UserMembership.findByPk(membershipId)) ?? (await _models.GroupMembership.findByPk(membershipId));
    if (!membership) {
      return false;
    }
    return {
      document,
      membership
    };
  }
  subject(_ref2) {
    let {
      actorName,
      document
    } = _ref2;
    return this.t(`{{ actorName }} shared “{{ documentTitle }}” with you`, {
      actorName,
      documentTitle: document.titleWithDefault
    });
  }
  preview(_ref3) {
    let {
      actorName
    } = _ref3;
    return this.t("{{ actorName }} shared a document", {
      actorName
    });
  }
  fromName(_ref4) {
    let {
      actorName
    } = _ref4;
    return actorName;
  }
  renderAsText(_ref5) {
    let {
      actorName,
      teamUrl,
      document
    } = _ref5;
    return `
${this.t(`{{ actorName }} shared “{{ documentTitle }}” with you.`, {
      actorName,
      documentTitle: document.titleWithDefault
    })}

${this.t("View Document")}: ${teamUrl}${document.path}
`;
  }
  render(props) {
    const {
      document,
      membership,
      actorName,
      teamUrl
    } = props;
    const documentUrl = `${teamUrl}${document.path}?ref=notification-email`;
    const permission = membership.permission === _types.DocumentPermission.Read ? this.t("view") : this.t("edit");
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentUrl,
        name: this.t("View Document")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: document.titleWithDefault
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("{{ actorName }} invited you to {{ permission }} the", {
            actorName,
            permission
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: documentUrl,
            children: document.titleWithDefault
          }), " ", this.t("document"), "."]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: documentUrl,
            children: this.t("View Document")
          })
        })]
      })]
    });
  }
}
exports.default = DocumentSharedEmail;