"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _time = require("../../../shared/utils/time");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _HTMLHelper = _interopRequireDefault(require("../../models/helpers/HTMLHelper"));
var _ShareSubscriptionHelper = _interopRequireDefault(require("../../models/helpers/ShareSubscriptionHelper"));
var _CacheHelper = require("../../utils/CacheHelper");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to a share subscriber when the shared document is updated.
 */
class ShareDocumentUpdatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    const subscription = await _models.ShareSubscription.findByPk(props.shareSubscriptionId, {
      include: [{
        model: _models.Share.unscoped(),
        include: [{
          association: "team"
        }]
      }]
    });
    if (!subscription || subscription.isUnsubscribed || !subscription.isConfirmed) {
      return false;
    }
    let body;
    const team = subscription.share?.team;
    if (props.revisionId && team?.getPreference(_types.TeamPreference.PreviewsInEmails)) {
      body = await _CacheHelper.CacheHelper.getDataOrSet(`diff:share:${props.revisionId}`, async () => {
        // generate the diff html for the email
        const revision = await _models.Revision.findByPk(props.revisionId);
        if (revision) {
          const before = await revision.before();
          const content = await _DocumentHelper.DocumentHelper.toEmailDiff(before, revision, {
            includeTitle: false,
            centered: false,
            signedUrls: 4 * _time.Day.seconds,
            baseUrl: props.shareUrl
          });

          // inline all css so that it works in as many email providers as possible.
          return content ? await _HTMLHelper.default.inlineCSS(content) : undefined;
        }
        return;
      }, 30, 10000);
    }
    return {
      unsubscribeUrl: _ShareSubscriptionHelper.default.unsubscribeUrl(subscription),
      body
    };
  }
  unsubscribeUrl(_ref) {
    let {
      unsubscribeUrl
    } = _ref;
    return unsubscribeUrl;
  }
  subject(_ref2) {
    let {
      documentTitle
    } = _ref2;
    return this.t(`"{{ documentTitle }}" updated`, {
      documentTitle
    });
  }
  preview(_ref3) {
    let {
      documentTitle
    } = _ref3;
    return this.t('"{{ documentTitle }}" has been updated.', {
      documentTitle
    });
  }
  renderAsText(_ref4) {
    let {
      documentTitle,
      shareUrl
    } = _ref4;
    return `
${this.t(`"{{ documentTitle }}" updated`, {
      documentTitle
    })}

${this.t("A document you subscribed to has been updated.")}

${this.t("View Document")}: ${shareUrl}
`;
  }
  render(_ref5) {
    let {
      documentTitle,
      shareUrl,
      unsubscribeUrl,
      body
    } = _ref5;
    const documentLink = `${shareUrl}?ref=subscription-email`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview({
        documentTitle
      }),
      goToAction: {
        url: documentLink,
        name: this.t("View Document")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: this.t(`"{{ documentTitle }}" updated`, {
            documentTitle
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [this.t("A document you subscribed to has been updated."), " ", this.t("Click below to view the latest version.")]
        }), body && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
            height: 20
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Diff.default, {
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              dangerouslySetInnerHTML: {
                __html: body
              }
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
            height: 20
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: documentLink,
            children: this.t("View Document")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails")
      })]
    });
  }
}
exports.default = ShareDocumentUpdatedEmail;