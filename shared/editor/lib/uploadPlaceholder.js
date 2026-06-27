"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.findPlaceholder = findPlaceholder;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _reactDom = _interopRequireDefault(require("react-dom"));
var _FileExtension = _interopRequireDefault(require("../components/FileExtension"));
var _multiplayer = require("./multiplayer");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// based on the example at: https://prosemirror.net/examples/upload/
const uploadPlaceholder = new _prosemirrorState.Plugin({
  state: {
    init() {
      return _prosemirrorView.DecorationSet.empty;
    },
    apply(tr, set) {
      // See if the transaction adds or removes any placeholders – the placeholder display is
      // different depending on if we're uploading an image, video or plain file
      const action = tr.getMeta(this);
      set = (0, _multiplayer.mapDecorations)(set, tr, !!action);
      if (action?.add) {
        if (action.add.replaceExisting) {
          const $pos = tr.doc.resolve(action.add.pos);
          const nodeAfter = $pos.nodeAfter;
          if (!nodeAfter) {
            return;
          }
          const deco = _prosemirrorView.Decoration.node($pos.pos, $pos.pos + nodeAfter.nodeSize, {
            class: `${nodeAfter.type.name}-replacement-uploading`
          }, {
            id: action.add.id
          });
          set = set.add(tr.doc, [deco]);
        } else if (action.add.isImage) {
          const element = document.createElement("div");
          element.className = "image placeholder";
          const img = document.createElement("img");
          img.src = action.add.src || (action.add.file ? URL.createObjectURL(action.add.file) : "");
          img.style.width = `${action.add.dimensions?.width}px`;
          element.appendChild(img);
          const deco = _prosemirrorView.Decoration.widget(action.add.pos, element, {
            id: action.add.id
          });
          set = set.add(tr.doc, [deco]);
        } else if (action.add.isVideo) {
          const element = document.createElement("div");
          element.className = "video placeholder";
          const video = document.createElement("video");
          video.src = URL.createObjectURL(action.add.file);
          video.autoplay = false;
          video.controls = false;
          video.width = action.add.dimensions?.width;
          video.height = action.add.dimensions?.height;
          element.appendChild(video);
          const deco = _prosemirrorView.Decoration.widget(action.add.pos, element, {
            id: action.add.id
          });
          set = set.add(tr.doc, [deco]);
        } else {
          const element = document.createElement("div");
          element.className = "file placeholder";
          const icon = document.createElement("div");
          const title = document.createElement("div");
          title.className = "title";
          title.innerText = action.add.file.name;
          const subtitle = document.createElement("div");
          subtitle.className = "subtitle";
          subtitle.innerText = "Uploading…";
          _reactDom.default.render(/*#__PURE__*/(0, _jsxRuntime.jsx)(_FileExtension.default, {
            title: action.add.file.name
          }), icon);
          element.appendChild(icon);
          element.appendChild(title);
          element.appendChild(subtitle);
          const deco = _prosemirrorView.Decoration.widget(action.add.pos, element, {
            id: action.add.id
          });
          set = set.add(tr.doc, [deco]);
        }
      }
      if (action?.remove) {
        set = set.remove(set.find(undefined, undefined, spec => spec.id === action.remove.id));
      }
      return set;
    }
  },
  props: {
    decorations(state) {
      return this.getState(state);
    }
  }
});
var _default = exports.default = uploadPlaceholder;
/**
 * Find the position of a placeholder by its ID
 *
 * @param state The editor state
 * @param id The placeholder ID
 * @returns The placeholder position as a tuple of [from, to] or null if not found
 */
function findPlaceholder(state, id) {
  const decos = uploadPlaceholder.getState(state);
  const found = decos?.find(undefined, undefined, spec => spec.id === id);
  return found?.length ? [found[0].from, found[0].to] : null;
}