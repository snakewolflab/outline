"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagramPlaceholder = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _reactI18next = require("react-i18next");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _Text = _interopRequireDefault(require("../../components/Text"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DiagramPlaceholder = _ref => {
  let {
    isSelected,
    onDoubleClick
  } = _ref;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Placeholder, {
    className: isSelected ? "ProseMirror-selectednode" : "",
    onDoubleClick: onDoubleClick,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
      size: "small",
      type: "secondary",
      as: "p",
      children: t("Empty diagram")
    }), " ", /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
      size: "small",
      type: "tertiary",
      italic: true,
      children: t("Double click to edit")
    })]
  });
};
exports.DiagramPlaceholder = DiagramPlaceholder;
const Placeholder = _styledComponents.default.div.withConfig({
  componentId: "sc-13gq15i-0"
})(["border:2px dashed ", ";background:", ";border-radius:", ";padding:16px;text-align:center;cursor:var(--pointer);"], (0, _styles.s)("inputBorder"), (0, _styles.s)("backgroundSecondary"), _EditorStyleHelper.EditorStyleHelper.blockRadius);