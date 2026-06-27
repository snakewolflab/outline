"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.determineIconType = void 0;
var _validator = require("validator");
var _types = require("../types");
var _IconLibrary = require("./IconLibrary");
const outlineIconNames = new Set(Object.keys(_IconLibrary.IconLibrary.mapping));
const determineIconType = icon => {
  if (!icon) {
    return;
  }
  return outlineIconNames.has(icon) ? _types.IconType.SVG : (0, _validator.isUUID)(icon) ? _types.IconType.Custom : _types.IconType.Emoji;
};
exports.determineIconType = determineIconType;