"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _NotificationSettingsHelper = _interopRequireDefault(require("../../models/helpers/NotificationSettingsHelper"));
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
 * Email sent to a user when their data export has failed for some reason.
 */
class ExportFailureEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    return {
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.ExportCompleted);
  }
  subject() {
    return this.t("Your requested export");
  }
  preview() {
    return this.t("Sorry, your requested data export has failed");
  }
  renderAsText() {
    return `
${this.t("Your Data Export")}

${this.t("Sorry, your requested data export has failed, please visit the admin section to try again \u2013 if the problem persists please contact support.")}
`;
  }
  render(_ref2) {
    let {
      teamUrl,
      unsubscribeUrl
    } = _ref2;
    const exportLink = `${teamUrl}/settings/export`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Your Data Export")
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("Sorry, your requested data export has failed, please visit the"), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: exportLink,
            rel: "noreferrer",
            target: "_blank",
            children: this.t("admin section")
          }), ".", " ", this.t("to try again \u2013 if the problem persists please contact support.")]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: exportLink,
            children: this.t("Go to export")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails")
      })]
    });
  }
}
exports.default = ExportFailureEmail;