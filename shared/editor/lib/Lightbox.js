"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLightboxNode = exports.LightboxImageFactory = exports.LightboxImage = void 0;
var _isCode = require("./isCode");
var _urls = require("../../utils/urls");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class LightboxImage {
  constructor() {
    _defineProperty(this, "pos", void 0);
    _defineProperty(this, "src", void 0);
    _defineProperty(this, "alt", void 0);
    _defineProperty(this, "source", void 0);
    _defineProperty(this, "element", void 0);
  }
}
exports.LightboxImage = LightboxImage;
class LightboxRegularImage extends LightboxImage {
  constructor(view, pos) {
    super();
    this.pos = pos;
    const node = view.state.doc.nodeAt(pos);
    this.src = (0, _urls.sanitizeImageSrc)(node?.attrs.src) ?? "";
    this.alt = node?.attrs.alt ?? "";
    this.source = node?.attrs.source;
    this.element = view.nodeDOM(pos);
  }
  getElement() {
    return this.element.querySelector("img");
  }
}
class LightboxMermaidImage extends LightboxImage {
  constructor(view, pos) {
    super();
    this.element = view.nodeDOM(pos);
    this.pos = pos;
    this.src = this.svgToSrc(this.extractSvg());
    this.alt = "";
  }
  svgToSrc(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  extractSvg() {
    const mermaidWrapper = this.element.nextElementSibling;
    if (!mermaidWrapper) {
      return "";
    }
    const svg = mermaidWrapper.firstElementChild;
    if (!svg || !(svg instanceof SVGElement)) {
      return "";
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }
  getElement() {
    return this.element.nextElementSibling?.firstElementChild;
  }
}
class LightboxImageFactory {
  static createLightboxImage(view, pos) {
    const node = view.state.doc.nodeAt(pos);
    if (isImage(node)) {
      return new LightboxRegularImage(view, pos);
    }
    if ((0, _isCode.isMermaid)(node)) {
      return new LightboxMermaidImage(view, pos);
    }
    throw new Error("Unsupported node type for LightboxImage");
  }
}
exports.LightboxImageFactory = LightboxImageFactory;
const isImage = node => node.type.name === "image";
const isLightboxNode = node => isImage(node) || (0, _isCode.isMermaid)(node);
exports.isLightboxNode = isLightboxNode;