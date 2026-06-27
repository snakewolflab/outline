"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCellAttrs = getCellAttrs;
exports.isValidCellMarks = exports.isValidCellAlignment = void 0;
exports.setCellAttrs = setCellAttrs;
var _browser = require("../../utils/browser");
var _color = require("../../utils/color");
var _polished = require("polished");
const ALLOWED_ALIGNMENTS = new Set(["left", "center", "right"]);

/**
 * Validates an alignment attribute value.
 *
 * @param value The value to validate.
 * @returns true if the value is a safe alignment or null.
 */
const isValidCellAlignment = value => value === null || typeof value === "string" && ALLOWED_ALIGNMENTS.has(value);

/**
 * Validates a table cell's `marks` attribute against the given schema. Checks
 * that the value is an array of well-formed mark objects whose type exists in
 * the schema, and — for `background` marks — that the color is a valid hex
 * value. `null` and `undefined` are both considered valid (the attribute is
 * optional).
 *
 * @param value The value to validate.
 * @param schema The editor schema, used to check mark types are registered.
 *               Optional — when absent, mark-type registration is not checked.
 * @returns true if the value is a valid marks array, null, or undefined.
 */
exports.isValidCellAlignment = isValidCellAlignment;
const isValidCellMarks = (value, schema) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (!Array.isArray(value)) {
    return false;
  }
  const marks = schema?.marks;
  return value.every(mark => {
    if (!mark || typeof mark !== "object") {
      return false;
    }
    const type = mark.type;
    if (typeof type !== "string") {
      return false;
    }
    if (marks && !Object.prototype.hasOwnProperty.call(marks, type)) {
      return false;
    }
    const attrs = mark.attrs;
    if (attrs !== undefined && (typeof attrs !== "object" || attrs === null)) {
      return false;
    }
    if (type === "background") {
      return typeof attrs?.color === "string" && (0, _color.validateColorHex)(attrs.color);
    }
    return true;
  });
};

/**
 * Helper to get cell attributes from a DOM node, used when pasting table content.
 *
 * @param dom DOM node to get attributes from
 * @returns Cell attributes
 */
exports.isValidCellMarks = isValidCellMarks;
function getCellAttrs(dom) {
  if (typeof dom === "string") {
    return {};
  }
  const widthAttr = dom.getAttribute("data-colwidth");
  const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(",").map(Number) : null;
  const colspan = Number(dom.getAttribute("colspan") || 1);
  const bgColor = dom.getAttribute("data-bgcolor");
  return {
    colspan,
    rowspan: Number(dom.getAttribute("rowspan") || 1),
    colwidth: widths && widths.length === colspan ? widths : null,
    alignment: dom.style.textAlign === "center" ? "center" : dom.style.textAlign === "right" ? "right" : null,
    marks: bgColor && (0, _color.validateColorHex)(bgColor) ? [{
      type: "background",
      attrs: {
        color: bgColor
      }
    }] : undefined
  };
}

/**
 * Helper to serialize cell attributes on a node, used when copying table content.
 *
 * @param node Node to get attributes from
 * @returns Attributes for the cell
 */
function setCellAttrs(node) {
  const attrs = {};
  if (node.attrs.colspan !== 1) {
    attrs.colspan = node.attrs.colspan;
  }
  if (node.attrs.rowspan !== 1) {
    attrs.rowspan = node.attrs.rowspan;
  }
  if (isValidCellAlignment(node.attrs.alignment) && node.attrs.alignment) {
    attrs.style = `text-align: ${node.attrs.alignment};`;
  }
  if (node.attrs.colwidth) {
    if (_browser.isBrowser) {
      attrs["data-colwidth"] = node.attrs.colwidth.map(Number).join(",");
    } else {
      attrs.style = (attrs.style ?? "") + `min-width: ${Number(node.attrs.colwidth[0])}px;`;
    }
  }
  if (Array.isArray(node.attrs.marks)) {
    const backgroundMark = node.attrs.marks.find(mark => mark?.type === "background" && typeof mark.attrs?.color === "string" && (0, _color.validateColorHex)(mark.attrs.color));
    if (backgroundMark) {
      const color = backgroundMark.attrs.color;
      attrs["data-bgcolor"] = color;
      attrs.style = (attrs.style ?? "") + `--cell-bg-color: ${color}; --cell-text-color: ${(0, _polished.readableColor)(color)};`;
    }
  }
  return attrs;
}