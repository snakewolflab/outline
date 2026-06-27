"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomEmoji = void 0;
var _useShare = _interopRequireDefault(require("../hooks/useShare"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CustomEmoji = _ref => {
  let {
    value,
    size = 16,
    cacheKey,
    ...props
  } = _ref;
  const {
    shareId
  } = (0, _useShare.default)();
  let src = `/api/emojis.redirect?id=${value}`;
  if (shareId) {
    src += `&shareId=${shareId}`;
  }
  if (cacheKey) {
    src += `&v=${encodeURIComponent(cacheKey)}`;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
    alt: "",
    src: src,
    style: {
      width: size,
      height: size,
      objectFit: "contain"
    },
    ...props
  });
};
exports.CustomEmoji = CustomEmoji;