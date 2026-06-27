"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
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
 * Email sent to a user when their account has just been created, or they signed
 * in for the first time from an invite.
 */
class WelcomeEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return this.t("Welcome to {{ appName }}!", {
      appName: _env.default.APP_NAME
    });
  }
  async beforeSend(props) {
    if (props.role === _types.UserRole.Guest) {
      return false;
    }
    return {};
  }
  preview() {
    return this.t("{{ appName }} is a place for your team to build and share knowledge.", {
      appName: _env.default.APP_NAME
    });
  }
  renderAsText(_ref) {
    let {
      teamUrl
    } = _ref;
    return `
${this.t("Welcome to {{ appName }}!", {
      appName: _env.default.APP_NAME
    })}

${this.t("{{ appName }} is a place for your team to build and share knowledge.", {
      appName: _env.default.APP_NAME
    })}

${this.t("To get started, head to the home screen and try creating a collection to help document your processes, create playbooks, or plan your team's work.")}

${this.t("Or, learn more about everything {{ appName }} can do in the guide", {
      appName: _env.default.APP_NAME
    })}:
https://docs.getoutline.com/s/guide

${teamUrl}/home
`;
  }
  render(_ref2) {
    let {
      teamUrl
    } = _ref2;
    const welcomeLink = `${teamUrl}/home?ref=welcome-email`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Welcome to {{ appName }}!", {
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("{{ appName }} is a place for your team to build and share knowledge.", {
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("To get started, head to the home screen and try creating a collection to help document your processes, create playbooks, or plan your team's work.")
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("Or, learn more about everything {{ appName }} can do in", {
            appName: _env.default.APP_NAME
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: "https://docs.getoutline.com/s/guide",
            children: this.t("the guide")
          }), "."]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: welcomeLink,
            children: this.t("Open {{ appName }}", {
              appName: _env.default.APP_NAME
            })
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.default = WelcomeEmail;