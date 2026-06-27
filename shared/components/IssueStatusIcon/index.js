"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IssueStatusIcon = IssueStatusIcon;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _types = require("../../types");
var _GitHubIssueStatusIcon = require("./GitHubIssueStatusIcon");
var _LinearIssueStatusIcon = require("./LinearIssueStatusIcon");
var _GitLabIssueStatusIcon = require("./GitLabIssueStatusIcon");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function IssueStatusIcon(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Icon, {
    size: props.size,
    className: props.className,
    children: getIcon(props)
  });
}
function getIcon(props) {
  switch (props.service) {
    case _types.IntegrationService.GitHub:
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GitHubIssueStatusIcon.GitHubIssueStatusIcon, {
        ...props
      });
    case _types.IntegrationService.Linear:
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_LinearIssueStatusIcon.LinearIssueStatusIcon, {
        ...props
      });
    case _types.IntegrationService.GitLab:
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GitLabIssueStatusIcon.GitLabIssueStatusIcon, {
        ...props
      });
  }
}
const Icon = _styledComponents.default.span.withConfig({
  componentId: "sc-nf1zwy-0"
})(["display:inline-flex;flex-shrink:0;width:", "px;height:", "px;align-items:center;justify-content:center;"], props => props.size ?? 24, props => props.size ?? 24);