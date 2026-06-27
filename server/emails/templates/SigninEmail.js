"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Email sent to a user when they request a magic sign-in link.
 */
class SigninEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Authentication;
  }
  subject(_ref) {
    let {
      token
    } = _ref;
    return token ? this.t("Magic Sign-in Link") : this.t("Sign in verification code");
  }
  preview() {
    return this.t("Here’s your link to signin to {{ appName }}.", {
      appName: _env.default.APP_NAME
    });
  }
  renderAsText(_ref2) {
    let {
      token,
      teamUrl,
      client,
      verificationCode
    } = _ref2;
    if (token) {
      return `
${this.t("Use the link below to sign in")}:

${this.signinLink(teamUrl, token, client)}

${this.t("If the link expired you can request a new one from your team's signin page at")}: ${teamUrl}
`;
    }
    return `
${this.t("Enter this verification code")}: ${verificationCode}

${this.t("If the code expired you can request a new one from your team's signin page at")}: ${teamUrl}
`;
  }
  render(_ref3) {
    let {
      token,
      client,
      teamUrl,
      verificationCode
    } = _ref3;
    if (_env.default.isDevelopment) {
      if (token) {
        _Logger.default.debug("email", `Sign-In link: ${this.signinLink(teamUrl, token, client)}`);
      }
      if (verificationCode) {
        _Logger.default.debug("email", `Verification code: ${verificationCode}`);
      }
    }
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      goToAction: token ? {
        url: this.signinLink(teamUrl, token, client),
        name: this.t("Sign In")
      } : undefined,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), token ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Magic Sign-in Link")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Click the button below to sign in to {{ appName }}.", {
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: this.signinLink(teamUrl, token, client),
            children: this.t("Sign In")
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 20
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("If the link expired you can request a new one from your team's sign-in page at"), ": ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: teamUrl,
            children: teamUrl
          })]
        })]
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Sign-in Code")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Enter this code on your team's sign-in page to continue.")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          style: {
            fontSize: "24px",
            letterSpacing: "0.25em",
            fontWeight: "bold",
            backgroundColor: "#F9FAFB",
            padding: "12px",
            borderRadius: "4px"
          },
          children: verificationCode
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 20
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("If the code expired you can request a new one from your team's sign-in page at"), ": ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: teamUrl,
            children: teamUrl
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
  signinLink(teamUrl, token, client) {
    return `${teamUrl}/auth/email.callback?token=${token}&client=${client}`;
  }
}
exports.default = SigninEmail;