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
 * Email sent to a user when they request to change their email.
 */
class ConfirmUpdateEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Authentication;
  }
  subject() {
    return this.t("Your email update request");
  }
  preview() {
    return this.t("Here’s your email change confirmation.");
  }
  renderAsText(_ref) {
    let {
      teamUrl,
      code,
      previous,
      to
    } = _ref;
    return `
${previous ? this.t("You requested to update your {{ appName }} account email. Please follow the link below to confirm the change from {{ previous }} to {{ to }}.", {
      appName: _env.default.APP_NAME,
      previous,
      to
    }) : this.t("You requested to update your {{ appName }} account email. Please follow the link below to confirm the change to {{ to }}.", {
      appName: _env.default.APP_NAME,
      to
    })}

  ${this.updateLink(teamUrl, code)}
  `;
  }
  render(_ref2) {
    let {
      teamUrl,
      code,
      previous,
      to
    } = _ref2;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Your email update request")
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [previous ? this.t("You requested to update your {{ appName }} account email. Please click below to confirm the change from {{ previous }} to", {
            appName: _env.default.APP_NAME,
            previous
          }) : this.t("You requested to update your {{ appName }} account email. Please click below to confirm the change to", {
            appName: _env.default.APP_NAME
          }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("strong", {
            children: to
          }), "."]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 5
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: this.updateLink(teamUrl, code),
            children: this.t("Confirm Change")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
  updateLink(teamUrl, code) {
    return `${teamUrl}/api/users.updateEmail?code=${code}`;
  }
}
exports.default = ConfirmUpdateEmail;