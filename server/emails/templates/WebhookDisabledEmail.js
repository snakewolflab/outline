"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
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
 * Email sent to the creator of a webhook when the webhook has become disabled
 * due to repeated failure.
 */
class WebhookDisabledEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return this.t("Warning") + ": " + this.t("Webhook disabled");
  }
  preview(_ref) {
    let {
      webhookName
    } = _ref;
    return this.t("Your webhook ({{ webhookName }}) has been disabled", {
      webhookName
    });
  }
  renderAsText(_ref2) {
    let {
      webhookName,
      teamUrl
    } = _ref2;
    return `
${this.t("Your webhook ({{ webhookName }}) has been automatically disabled due to a high failure rate in recent delivery attempts. You can re-enable by editing the webhook.", {
      webhookName
    })}

${this.t("Webhook settings")}: ${teamUrl}/settings/webhooks
`;
  }
  render(props) {
    const {
      webhookName,
      teamUrl
    } = props;
    const webhookSettingsLink = `${teamUrl}/settings/webhooks`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Webhook disabled")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Your webhook ({{ webhookName }}) has been automatically disabled due to a high failure rate in recent delivery attempts. You can re-enable by editing the webhook.", {
            webhookName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: webhookSettingsLink,
            children: this.t("Webhook settings")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.default = WebhookDisabledEmail;