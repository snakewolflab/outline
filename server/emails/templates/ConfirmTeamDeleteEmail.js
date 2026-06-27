"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _env = _interopRequireDefault(require("../../env"));
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _CopyableCode = _interopRequireDefault(require("./components/CopyableCode"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to a user when they request to delete their workspace.
 */
class ConfirmTeamDeleteEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return this.t("Your workspace deletion request");
  }
  preview() {
    return this.t("Your requested workspace deletion code");
  }
  renderAsText(_ref) {
    let {
      deleteConfirmationCode
    } = _ref;
    return `
${this.t("You requested to permanently delete your {{ appName }} workspace. Please enter the code below to confirm your workspace deletion.", {
      appName: _env.default.APP_NAME
    })}

${this.t("Code")}: ${deleteConfirmationCode}
`;
  }
  render(_ref2) {
    let {
      deleteConfirmationCode
    } = _ref2;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Your workspace deletion request")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("You requested to permanently delete your {{ appName }} workspace. Please enter the code below to confirm your workspace deletion.", {
            appName: _env.default.APP_NAME
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 5
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CopyableCode.default, {
            children: deleteConfirmationCode
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.default = ConfirmTeamDeleteEmail;