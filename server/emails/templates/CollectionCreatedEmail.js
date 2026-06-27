"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("../../../shared/types");
var _models = require("../../models");
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
 * Email sent to a user when they have enabled notifications of new collection
 * creation.
 */
class CollectionCreatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    const collection = await _models.Collection.findByPk(props.collectionId, {
      includeOwner: true
    });
    if (!collection) {
      return false;
    }
    return {
      collection,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.CreateCollection);
  }
  subject(_ref2) {
    let {
      collection
    } = _ref2;
    return this.t("“{{ collectionName }}” created", {
      collectionName: collection.name
    });
  }
  preview(_ref3) {
    let {
      collection
    } = _ref3;
    return this.t("{{ userName }} created a collection", {
      userName: collection.user.name
    });
  }
  renderAsText(_ref4) {
    let {
      teamUrl,
      collection
    } = _ref4;
    return `
${collection.name}

${this.t("{{ userName }} created the collection “{{ collectionName }}”", {
      userName: collection.user.name,
      collectionName: collection.name
    })}

${this.t("Open Collection")}: ${teamUrl}${collection.path}
`;
  }
  render(props) {
    const {
      collection,
      teamUrl,
      unsubscribeUrl
    } = props;
    const collectionLink = `${teamUrl}${collection.path}`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: collectionLink,
        name: this.t("View Collection")
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: collection.name
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: this.t("{{ userName }} created the collection “{{ collectionName }}”.", {
            userName: collection.user.name,
            collectionName: collection.name
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmptySpace.default, {
          height: 10
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: collectionLink,
            children: this.t("Open Collection")
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Footer.default, {
        unsubscribeUrl: unsubscribeUrl,
        unsubscribeText: this.t("Unsubscribe from these emails")
      })]
    });
  }
}
exports.default = CollectionCreatedEmail;