"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _i18next = require("i18next");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _sonner = require("sonner");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g;
const pluginKey = new _prosemirrorState.PluginKey("hex_color_preview");

/**
 * An editor extension that renders a small colored circle after any valid hex
 * color code found inside an inline code mark.
 */
class HexColorPreview extends _Extension.default {
  get name() {
    return "hex_color_preview";
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      key: pluginKey,
      state: {
        init: (_, state) => ({
          decorations: this.buildDecorations(state)
        }),
        apply: (tr, pluginState, _oldState, newState) => {
          if (!tr.docChanged) {
            return pluginState;
          }
          return {
            decorations: this.buildDecorations(newState)
          };
        }
      },
      props: {
        decorations: state => pluginKey.getState(state)?.decorations
      }
    })];
  }
  buildDecorations(state) {
    const codeMarkType = state.schema.marks.code_inline;
    if (!codeMarkType) {
      return _prosemirrorView.DecorationSet.empty;
    }
    const decorations = [];
    state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) {
        return;
      }
      const codeMark = node.marks.find(mark => mark.type === codeMarkType);
      if (!codeMark) {
        return;
      }
      const text = node.text;
      HEX_COLOR_REGEX.lastIndex = 0;
      let match;
      while ((match = HEX_COLOR_REGEX.exec(text)) !== null) {
        const hex = match[0];
        const end = pos + match.index + hex.length;
        decorations.push(_prosemirrorView.Decoration.widget(end, () => this.createSwatch(hex), {
          // Use side: -1 so the swatch renders before the fake-cursor widget
          // from prosemirror-codemark, which uses side 0/-1 to represent the
          // "inside"/"outside" cursor positions at mark boundaries.
          side: -1,
          key: `hex-${hex}`,
          marks: [codeMark]
        }));
      }
    });
    return _prosemirrorView.DecorationSet.create(state.doc, decorations);
  }
  createSwatch(color) {
    const swatch = document.createElement("span");
    swatch.className = _EditorStyleHelper.EditorStyleHelper.hexColorSwatch;
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.backgroundColor = color;
    const luminance = this.getRelativeLuminance(color);
    if (luminance > 0.85) {
      swatch.classList.add(_EditorStyleHelper.EditorStyleHelper.hexColorSwatchLight);
    } else if (luminance < 0.1) {
      swatch.classList.add(_EditorStyleHelper.EditorStyleHelper.hexColorSwatchDark);
    }
    swatch.addEventListener("mousedown", event => {
      // Prevent the editor from moving the cursor into the code mark on click.
      event.preventDefault();
    });
    swatch.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      (0, _copyToClipboard.default)(color);
      _sonner.toast.message((0, _i18next.t)("Copied to clipboard"));
    });
    return swatch;
  }
  getRelativeLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const channel = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }
}
exports.default = HexColorPreview;