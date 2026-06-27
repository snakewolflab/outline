"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _polished = require("polished");
var _toggleMark = require("../commands/toggleMark");
var _markInputRule = require("../lib/markInputRule");
var _mark = _interopRequireDefault(require("../rules/mark"));
var _Mark = _interopRequireDefault(require("./Mark"));
var _color = require("../../utils/color");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Highlight extends _Mark.default {
  /**
   * Checks if a color is one of the highlight preset colors.
   *
   * @param color - A hex color string to check.
   * @returns true if the color matches a preset color's hex value.
   */
  static isPresetColor(color) {
    return Highlight.presetColors.some(c => c.hex === color);
  }

  /**
   * Finds the closest matching preset color for a given CSS color value.
   *
   * @param cssColor - A CSS color value (hex, rgb, rgba, etc.).
   * @returns The matching preset color hex, or null if no close match found.
   */
  static findMatchingPresetColor(cssColor) {
    try {
      const parsed = (0, _polished.parseToRgb)(cssColor);
      const inputRgb = {
        r: parsed.red,
        g: parsed.green,
        b: parsed.blue
      };
      for (const preset of Highlight.presetColors) {
        const presetRgb = (0, _color.hexToRgba)(preset.hex);
        // Allow some tolerance for color matching (e.g., due to opacity differences)
        const tolerance = 30;
        if (Math.abs(inputRgb.r - presetRgb.red) <= tolerance && Math.abs(inputRgb.g - presetRgb.green) <= tolerance && Math.abs(inputRgb.b - presetRgb.blue) <= tolerance) {
          return preset.hex;
        }
      }
    } catch {
      // Failed to parse the color
    }
    return null;
  }
  get name() {
    return "highlight";
  }
  get schema() {
    return {
      attrs: {
        color: {
          default: null,
          validate: "string|null"
        }
      },
      parseDOM: [{
        tag: "mark",
        getAttrs: dom => {
          const color = dom.getAttribute("data-color") || "";
          return {
            color: (0, _classValidator.isHexColor)(color) ? color : null
          };
        }
      }, {
        tag: "span[style]",
        getAttrs: dom => {
          const style = dom.style.backgroundColor;
          if (!style) {
            return false;
          }
          const matchedColor = Highlight.findMatchingPresetColor(style);
          // Only apply highlight if we found a matching preset color
          // or if the color is clearly a highlight (not white/transparent)
          if (matchedColor) {
            return {
              color: matchedColor
            };
          }
          // Check if it's a meaningful background color (not white/transparent)
          try {
            const parsed = (0, _polished.parseToRgb)(style);
            // Skip very light colors that are likely page backgrounds
            const isLight = parsed.red > 250 && parsed.green > 250 && parsed.blue > 250;
            if (!isLight) {
              return {
                color: null
              };
            }
          } catch {
            // Failed to parse
          }
          return false;
        }
      }],
      toDOM: node => ["mark", {
        "data-color": node.attrs.color,
        style: `background-color: ${(0, _polished.rgba)(node.attrs.color || Highlight.presetColors[0].hex, Highlight.opacity)}`
      }]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _markInputRule.markInputRuleForPattern)("==", type)];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-Shift-h": (0, _toggleMark.toggleMark)(type)
    };
  }
  get rulePlugins() {
    return [(0, _mark.default)({
      delim: "==",
      mark: "highlight"
    })];
  }
  toMarkdown() {
    return {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  parseMarkdown() {
    return {
      mark: "highlight"
    };
  }
}
exports.default = Highlight;
/** The default opacity of the highlight */
_defineProperty(Highlight, "opacity", 0.4);
/** Preset colors available for highlighting */
_defineProperty(Highlight, "presetColors", _color.presetColors);