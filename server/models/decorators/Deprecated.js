"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const Deprecated = message => (_target, propertyKey) => {
  if (process.env[propertyKey]) {
    // oxlint-disable-next-line no-console
    console.warn(`The environment variable ${propertyKey} is deprecated and will be removed in a future release. ${message}`);
  }
};
var _default = exports.default = Deprecated;