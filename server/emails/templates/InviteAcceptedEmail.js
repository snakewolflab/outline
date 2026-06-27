"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _env = _interopRequireDefault(require("../../env"));
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
 * Email sent to a user when someone they invited successfully signs up.
 */
class InviteAcceptedEmail extends _BaseEmail.default {
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
      inviterId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(inviterId, _types.NotificationEventType.InviteAccepted);
  }
  subject(_ref2) {
    let {
      invitedName
    } = _ref2;
    return this.t("{{ invitedName }} has joined your {{ appName }} team", {
      invitedName,
      appName: _env.default.APP_NAME
    });
  }
  preview(_ref3) {
    let {
      invitedName
    } = _ref3;
    return this.t("Great news, {{ invitedName }}, accepted your invitation", {
      invitedName
    });
  }
  renderAsText(_ref4) {
    let {
      invitedName,
      teamUrl
    } = _ref4;
    return `
${this.t("Great news, {{ invitedName }} just accepted your invitation and has created an account. You can now start collaborating on documents.", {
      invitedName
    })}

${this.t("Open {{ appName }}", {
      appName: _env.default.APP_NAME
    }) + ":"} ${teamUrl}
`;
  }
  render(_ref5) {
    let {
      invitedName,
      teamUrl,
      unsubscribeUrl
    } = _ref5;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview({
        invitedName
      }),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t("{{ invitedName }} has joined your team", {
            invitedName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("Great news, {{ invitedName }} just accepted your invitation and has created an account. You can now start collaborating on documents.", {
            invitedName
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: teamUrl,
            children: this.t("Open {{ appName }}", {
              appName: _env.default.APP_NAME
            })
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails")
      })]
    });
  }
}
exports.default = InviteAcceptedEmail;