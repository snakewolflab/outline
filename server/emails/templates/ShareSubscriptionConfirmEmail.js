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
 * Email sent to confirm a share subscription request.
 */
class ShareSubscriptionConfirmEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Authentication;
  }
  subject() {
    return this.t("Confirm your subscription");
  }
  preview(_ref) {
    let {
      documentTitle
    } = _ref;
    return this.t('Confirm your subscription to receive updates when "{{ documentTitle }}" changes.', {
      documentTitle
    });
  }
  renderAsText(_ref2) {
    let {
      documentTitle,
      confirmUrl,
      teamName
    } = _ref2;
    const appName = teamName ?? _env.default.APP_NAME;
    return `
${this.t("Confirm your subscription")}

${this.t('You requested to receive email notifications when "{{ documentTitle }}" is updated on {{ appName }}. Please confirm your subscription by following the link below.', {
      documentTitle,
      appName
    })}

${this.t("Confirm Subscription")}: ${confirmUrl}

${this.t("This link will expire in 24 hours.")}
`;
  }
  render(_ref3) {
    let {
      documentTitle,
      confirmUrl,
      teamName
    } = _ref3;
    const appName = teamName ?? _env.default.APP_NAME;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview({
        documentTitle
      }),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("Confirm your subscription")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t('You requested to receive email notifications when "{{ documentTitle }}" is updated on {{ appName }}.', {
            documentTitle,
            appName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Please confirm your subscription by clicking the button below.")
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 5
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: confirmUrl,
            children: this.t("Confirm Subscription")
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 5
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("em", {
            children: this.t("This link will expire in 24 hours.")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {})]
    });
  }
}
exports.default = ShareSubscriptionConfirmEmail;