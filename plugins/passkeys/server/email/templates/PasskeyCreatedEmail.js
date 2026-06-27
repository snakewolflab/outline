"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasskeyCreatedEmail = void 0;
var _env = _interopRequireDefault(require("../../../../../server/env"));
var _BaseEmail = _interopRequireWildcard(require("../../../../../server/emails/templates/BaseEmail"));
var _Body = _interopRequireDefault(require("../../../../../server/emails/templates/components/Body"));
var _Button = _interopRequireDefault(require("../../../../../server/emails/templates/components/Button"));
var _EmailLayout = _interopRequireDefault(require("../../../../../server/emails/templates/components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("../../../../../server/emails/templates/components/EmptySpace"));
var _Footer = _interopRequireDefault(require("../../../../../server/emails/templates/components/Footer"));
var _Header = _interopRequireDefault(require("../../../../../server/emails/templates/components/Header"));
var _Heading = _interopRequireDefault(require("../../../../../server/emails/templates/components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Email sent to a user when a new passkey is created on their account.
 */
class PasskeyCreatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return this.t("New passkey added to your {{ appName }} account", {
      appName: _env.default.APP_NAME
    });
  }
  preview() {
    return this.t("A new passkey was created for your account.");
  }
  renderAsText(_ref) {
    let {
      passkeyName,
      teamUrl
    } = _ref;
    return `
${this.t("New Passkey Created")}

${this.t("A new passkey has been added to your {{ appName }} account", {
      appName: _env.default.APP_NAME
    }) + ":"}

${passkeyName}

${this.t("Passkeys provide a secure, passwordless way to sign in to your account. If you did not create this passkey, please review your account security settings immediately.")}

${this.t("You can manage your passkeys at any time")}:
${teamUrl}/settings/passkeys

---

${this.t("If you have any concerns about your account security, please contact a workspace admin.")}
`;
  }
  render(_ref2) {
    let {
      passkeyName,
      teamUrl
    } = _ref2;
    const securityUrl = `${teamUrl}/settings/passkeys`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("New Passkey Created")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("A new passkey has been added to your {{ appName }} account", {
            appName: _env.default.APP_NAME
          }) + ":"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("strong", {
            children: passkeyName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Passkeys provide a secure, passwordless way to sign in to your account. If you did not create this passkey, please review your account security settings immediately.")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: securityUrl,
            children: this.t("Manage Passkeys")
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          style: {
            fontSize: "14px",
            color: "#666"
          },
          children: this.t("If you have any concerns about your account security, please contact a workspace admin.")
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.PasskeyCreatedEmail = PasskeyCreatedEmail;