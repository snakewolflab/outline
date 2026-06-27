"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _env = _interopRequireDefault(require("../../env"));
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to an external user when an admin sends them an invite and they
 * haven't signed in after a few days.
 */
class InviteReminderEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Invitation;
  }
  subject(_ref) {
    let {
      actorName,
      teamName
    } = _ref;
    return this.t("Reminder") + ": " + this.t("{{ actorName }} invited you to join {{ teamName }}’s workspace", {
      actorName,
      teamName
    });
  }
  preview() {
    return this.t("{{ appName }} is a place for your team to build and share knowledge.", {
      appName: _env.default.APP_NAME
    });
  }
  renderAsText(_ref2) {
    let {
      teamName,
      actorName,
      actorEmail,
      teamUrl
    } = _ref2;
    return `
${this.t("This is just a quick reminder that {{ actorName }} {{ actorEmail }} invited you to join them in the {{ teamName }} team on {{ appName }}, a place for your team to build and share knowledge.", {
      actorName,
      actorEmail: actorEmail ? `(${actorEmail})` : "",
      teamName,
      appName: _env.default.APP_NAME
    })}
${this.t("We only send a reminder once.")}

${this.t("If you haven't signed up yet, you can do so here")}: ${teamUrl}
`;
  }
  render(_ref3) {
    let {
      teamName,
      actorName,
      actorEmail,
      teamUrl
    } = _ref3;
    const inviteLink = `${teamUrl}?ref=invite-reminder-email`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Join {{ teamName }} on {{ appName }}", {
            teamName,
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("This is just a quick reminder that {{ actorName }} {{ actorEmail }} invited you to join them in the {{ teamName }} team on {{ appName }}, a place for your team to build and share knowledge.", {
            actorName,
            actorEmail: actorEmail ? `(${actorEmail})` : "",
            teamName,
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("If you haven't signed up yet, you can do so here"), ":"]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: inviteLink,
            children: this.t("Join now")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.default = InviteReminderEmail;