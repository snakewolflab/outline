"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _models = require("../../models");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Email sent to users who can manage a document when someone requests access.
 */
class DocumentAccessRequestEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      documentId,
      actorId
    } = _ref;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const actor = await _models.User.findByPk(actorId);
    if (!actor) {
      return false;
    }
    return {
      document,
      actor
    };
  }
  subject(_ref2) {
    let {
      actor,
      document
    } = _ref2;
    return `${actor.name} is requesting access to "${document.titleWithDefault}"`;
  }
  preview(_ref3) {
    let {
      actor
    } = _ref3;
    return `${actor.name} is requesting access to a document`;
  }
  fromName(_ref4) {
    let {
      actor
    } = _ref4;
    return actor.name;
  }
  renderAsText(_ref5) {
    let {
      actor,
      teamUrl,
      document
    } = _ref5;
    return `
${actor.name} is requesting access to "${document.titleWithDefault}".

Open the document to share it with them: ${teamUrl}${document.path}
`;
  }
  render(props) {
    const {
      document,
      actor,
      teamUrl
    } = props;
    const documentUrl = `${teamUrl}${document.path}?ref=notification-email&notifications=true`;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentUrl,
        name: "View Document"
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Body.default, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Heading.default, {
          children: document.titleWithDefault
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          children: [actor.name, " is requesting access to the", " ", /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
            href: documentUrl,
            children: document.titleWithDefault
          }), " document."]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: "Open the document to share it with them."
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            href: documentUrl,
            children: "View Document"
          })
        })]
      })]
    });
  }
}
exports.default = DocumentAccessRequestEmail;