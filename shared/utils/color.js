"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateColorHex = exports.toRGB = exports.stringToColor = exports.rgbaToHex = exports.presetColors = exports.palette = exports.hexToRgba = exports.getTextColor = void 0;
var _md = _interopRequireDefault(require("crypto-js/md5"));
var _polished = require("polished");
var _theme = _interopRequireDefault(require("../styles/theme"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const palette = exports.palette = [_theme.default.brand.red, _theme.default.brand.blue, _theme.default.brand.purple, _theme.default.brand.pink, _theme.default.brand.dusk, _theme.default.brand.green, _theme.default.brand.yellow, (0, _polished.darken)(0.2, _theme.default.brand.red), (0, _polished.darken)(0.2, _theme.default.brand.blue), (0, _polished.darken)(0.2, _theme.default.brand.purple), (0, _polished.darken)(0.2, _theme.default.brand.pink), (0, _polished.darken)(0.2, _theme.default.brand.dusk), (0, _polished.darken)(0.2, _theme.default.brand.green), (0, _polished.darken)(0.2, _theme.default.brand.yellow)];
const validateColorHex = color => /^#(?:[0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
exports.validateColorHex = validateColorHex;
const stringToColor = input => {
  const inputAsNumber = parseInt((0, _md.default)(input).toString(), 16);
  return palette[inputAsNumber % palette.length];
};

/**
 * Converts a color to string of RGB values separated by commas
 *
 * @param color - A color string
 * @returns A string of RGB values separated by commas
 */
exports.stringToColor = stringToColor;
const toRGB = color => Object.values((0, _polished.parseToRgb)(color)).join(", ");

/**
 * Returns the text color that contrasts the given background color
 *
 * @param background - A color string
 * @returns A color string
 */
exports.toRGB = toRGB;
const getTextColor = background => {
  const r = parseInt(background.substring(1, 3), 16);
  const g = parseInt(background.substring(3, 5), 16);
  const b = parseInt(background.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
};
exports.getTextColor = getTextColor;
const round = function (number) {
  let digits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Math.pow(10, digits);
  return Math.round(base * number) / base;
};
const toHex = number => {
  const hex = number.toString(16);
  return hex.length < 2 ? "0" + hex : hex;
};
const rgbaToHex = _ref => {
  let {
    red,
    green,
    blue,
    alpha
  } = _ref;
  const alphaHex = alpha < 1 ? toHex(round(alpha * 255)) : "";
  return "#" + toHex(red) + toHex(green) + toHex(blue) + alphaHex;
};
exports.rgbaToHex = rgbaToHex;
const presetColors = exports.presetColors = [{
  hex: "#FDEA9B",
  name: "Coral"
}, {
  hex: "#FED46A",
  name: "Apricot"
}, {
  hex: "#FA551E",
  name: "Sunset"
}, {
  hex: "#B4DC19",
  name: "Smoothie"
}, {
  hex: "#C8AFF0",
  name: "Bubblegum"
}, {
  hex: "#3CBEFC",
  name: "Neon"
}];
const hexToRgba = hex => {
  if (hex[0] === "#") {
    hex = hex.substring(1);
  }
  if (hex.length < 6) {
    return {
      red: parseInt(hex[0] + hex[0], 16),
      green: parseInt(hex[1] + hex[1], 16),
      blue: parseInt(hex[2] + hex[2], 16),
      alpha: hex.length === 4 ? round(parseInt(hex[3] + hex[3], 16) / 255, 2) : 1
    };
  }
  return {
    red: parseInt(hex.substring(0, 2), 16),
    green: parseInt(hex.substring(2, 4), 16),
    blue: parseInt(hex.substring(4, 6), 16),
    alpha: hex.length === 8 ? round(parseInt(hex.substring(6, 8), 16) / 255, 2) : 1
  };
};
exports.hexToRgba = hexToRgba;