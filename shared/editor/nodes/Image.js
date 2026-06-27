"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadImageNode = exports.default = void 0;
var _i18next = require("i18next");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _urls = require("../../utils/urls");
var _Caption = _interopRequireDefault(require("../components/Caption"));
var _Image2 = _interopRequireDefault(require("../components/Image"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _SimpleImage = _interopRequireDefault(require("./SimpleImage"));
var _Lightbox = require("../lib/Lightbox");
var _FileHelper = require("../lib/FileHelper");
var _DiagramPlaceholder = require("../components/DiagramPlaceholder");
var _comment = require("../commands/comment");
var _link = require("../commands/link");
var _CommentedImagePlugin = require("../plugins/CommentedImagePlugin");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const imageSizeRegex = /\s=(\d+)?x(\d+)?$/;
const parseTitleAttribute = tokenTitle => {
  const attributes = {
    layoutClass: undefined,
    title: undefined,
    width: undefined,
    height: undefined
  };
  if (!tokenTitle) {
    return attributes;
  }
  ["right-50", "left-50", "full-width"].map(className => {
    if (tokenTitle.includes(className)) {
      attributes.layoutClass = className;
      tokenTitle = tokenTitle.replace(className, "");
    }
  });
  const match = tokenTitle.match(imageSizeRegex);
  if (match) {
    attributes.width = match[1] ? parseInt(match[1], 10) : undefined;
    attributes.height = match[2] ? parseInt(match[2], 10) : undefined;
    tokenTitle = tokenTitle.replace(imageSizeRegex, "");
  }
  attributes.title = tokenTitle;
  return attributes;
};
const downloadImageNode = async (node, cache) => {
  try {
    const image = await fetch(node.attrs.src, {
      cache
    });
    const imageBlob = await image.blob();
    const imageURL = URL.createObjectURL(imageBlob);
    const extension = imageBlob.type.split(/\/|\+/g)[1];
    const potentialName = node.attrs.alt || "image";

    // create a temporary link node and click it with our image data
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `${potentialName}.${extension}`;
    document.body.appendChild(link);
    link.click();

    // cleanup
    document.body.removeChild(link);
  } catch {
    if (cache !== "reload") {
      await downloadImageNode(node, "reload");
    } else {
      window.open((0, _urls.sanitizeImageSrc)(node.attrs.src), "_blank");
    }
  }
};
exports.downloadImageNode = downloadImageNode;
class Image extends _SimpleImage.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "handleChangeSize", _ref => {
      let {
        node,
        getPos
      } = _ref;
      return _ref2 => {
        let {
          width,
          height
        } = _ref2;
        const {
          view,
          commands
        } = this.editor;
        const {
          doc,
          tr
        } = view.state;
        const pos = getPos();
        const $pos = doc.resolve(pos);
        view.dispatch(tr.setSelection(new _prosemirrorState.NodeSelection($pos)));
        commands["resizeImage"]({
          width,
          height: height || node.attrs.height
        });
      };
    });
    _defineProperty(this, "handleCaptionKeyDown", _ref3 => {
      let {
        node,
        getPos
      } = _ref3;
      return event => {
        // Pressing Enter in the caption field should move the cursor/selection
        // below the image and create a new paragraph.
        if (event.key === "Enter") {
          event.preventDefault();
          const {
            view
          } = this.editor;
          const $pos = view.state.doc.resolve(getPos() + node.nodeSize);
          view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near($pos)).split($pos.pos).scrollIntoView());
          view.focus();
          return;
        }

        // Pressing Backspace in an empty caption field focused the image.
        if (event.key === "Backspace" && event.currentTarget.innerText === "") {
          event.preventDefault();
          event.stopPropagation();
          const {
            view
          } = this.editor;
          const $pos = view.state.doc.resolve(getPos());
          const tr = view.state.tr.setSelection(new _prosemirrorState.NodeSelection($pos));
          view.dispatch(tr);
          view.focus();
          return;
        }
      };
    });
    _defineProperty(this, "handleCaptionBlur", _ref4 => {
      let {
        node,
        getPos
      } = _ref4;
      return event => {
        const caption = event.currentTarget.innerText;
        if (caption === node.attrs.alt) {
          return;
        }
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;

        // update meta on object
        const pos = getPos();
        const transaction = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          alt: caption
        });
        view.dispatch(transaction);
      };
    });
    _defineProperty(this, "handleZoomIn", _ref5 => {
      let {
        getPos,
        view
      } = _ref5;
      return () => {
        this.editor.updateActiveLightboxImage(_Lightbox.LightboxImageFactory.createLightboxImage(view, getPos()));
      };
    });
    _defineProperty(this, "handleClick", _ref6 => {
      let {
        getPos,
        view
      } = _ref6;
      return () => {
        this.editor.updateActiveLightboxImage(_Lightbox.LightboxImageFactory.createLightboxImage(view, getPos()));
      };
    });
    _defineProperty(this, "handleDownload", _ref7 => {
      let {
        node
      } = _ref7;
      return event => {
        event.preventDefault();
        event.stopPropagation();
        return downloadImageNode(node);
      };
    });
    _defineProperty(this, "handleEditDiagram", _ref8 => {
      let {
        getPos,
        view
      } = _ref8;
      return () => {
        const {
          commands
        } = this.editor;
        if (!commands.editDiagram) {
          return;
        }
        const pos = getPos();
        const $pos = view.state.doc.resolve(pos);
        view.dispatch(view.state.tr.setSelection(new _prosemirrorState.NodeSelection($pos)));
        commands.editDiagram();
      };
    });
    _defineProperty(this, "component", props => {
      if (props.node.attrs.source === _FileHelper.ImageSource.DiagramsNet && !props.node.attrs.src) {
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_DiagramPlaceholder.DiagramPlaceholder, {
          onDoubleClick: this.handleEditDiagram(props),
          ...props
        });
      }
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Image2.default, {
        ...props,
        onClick: this.handleClick(props),
        onDownload: this.handleDownload(props),
        onZoomIn: this.handleZoomIn(props),
        onChangeSize: this.handleChangeSize(props),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Caption.default, {
          width: props.node.attrs.width,
          onBlur: this.handleCaptionBlur(props),
          onKeyDown: this.handleCaptionKeyDown(props),
          isSelected: props.isSelected,
          placeholder: (0, _i18next.t)("Write a caption"),
          children: props.node.attrs.alt
        })
      });
    });
  }
  get schema() {
    return {
      inline: true,
      attrs: {
        src: {
          default: "",
          validate: "string"
        },
        width: {
          default: undefined
        },
        height: {
          default: undefined
        },
        alt: {
          default: null,
          validate: "string|null"
        },
        source: {
          default: null,
          validate: "string|null"
        },
        layoutClass: {
          default: null,
          validate: "string|null"
        },
        title: {
          default: null,
          validate: "string|null"
        },
        marks: {
          default: undefined
        }
      },
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      atom: true,
      parseDOM: [{
        tag: "div[class~=image]",
        getAttrs: dom => {
          const img = dom.getElementsByTagName("img")[0];
          const className = dom.className;
          const layoutClassMatched = className && className.match(/image-(.*)$/);
          const layoutClass = layoutClassMatched ? layoutClassMatched[1] : null;
          const width = img?.getAttribute("width");
          const height = img?.getAttribute("height");

          // A link wrapping the image is stored as a node attribute rather
          // than a mark, parse it back so it survives copy/paste. Sanitize
          // the href as it is rendered directly into the DOM by the view.
          const href = (0, _urls.sanitizeUrl)(img?.closest("a")?.getAttribute("href"));
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            title: img?.getAttribute("title"),
            source: img?.getAttribute("source"),
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined,
            layoutClass,
            marks: href ? [{
              type: "link",
              attrs: {
                href
              }
            }] : undefined
          };
        }
      }, {
        tag: "img",
        getAttrs: dom => {
          // Don't parse images from our own editor with this rule. A linked
          // image nests the <img> inside an <a>, so check ancestors too.
          if (dom.closest(".image") || dom.closest(".emoji")) {
            return false;
          }

          // First try HTML attributes
          let width = dom.getAttribute("width");
          let height = dom.getAttribute("height");

          // If no HTML attributes, try CSS styles
          if (!width && dom.style.width) {
            const styleWidth = dom.style.width;
            if (styleWidth.endsWith("px")) {
              width = styleWidth.slice(0, -2);
            }
          }
          if (!height && dom.style.height) {
            const styleHeight = dom.style.height;
            if (styleHeight.endsWith("px")) {
              height = styleHeight.slice(0, -2);
            }
          }
          return {
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
            title: dom.getAttribute("title"),
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined
          };
        }
      }],
      toDOM: node => {
        const className = node.attrs.layoutClass ? `image image-${node.attrs.layoutClass}` : "image";

        // `marks` is held separately below and is not a valid DOM attribute.
        const {
          marks,
          ...attrs
        } = node.attrs;
        const img = ["img", {
          ...attrs,
          src: (0, _urls.sanitizeImageSrc)(node.attrs.src),
          width: node.attrs.width,
          height: node.attrs.height,
          contentEditable: "false"
        }];

        // A link applied to an image is held as a node attribute rather than a
        // mark, so it must be written into the DOM explicitly here.
        const linkHref = marks?.find(mark => mark.type === "link")?.attrs?.href;
        const href = typeof linkHref === "string" ? linkHref : undefined;
        const children = [href ? ["a", {
          href: (0, _urls.sanitizeUrl)(href)
        }, img] : img];
        if (node.attrs.alt) {
          children.push(["p", {
            class: _EditorStyleHelper.EditorStyleHelper.imageCaption
          }, node.attrs.alt]);
        }
        return ["div", {
          class: className
        }, ...children];
      },
      leafText: node => node.attrs.alt ? `(image: ${node.attrs.alt})` : "(image)"
    };
  }
  get plugins() {
    return [...super.plugins, (0, _CommentedImagePlugin.commentedImagePlugin)(), new _prosemirrorState.Plugin({
      props: {
        handleDOMEvents: {
          dragstart: (_view, event) => {
            // ProseMirror lets the browser snapshot the dragged node's DOM as
            // the drag image. For images that DOM includes the caption area and
            // padding, which renders as a large white box around the image.
            // Substitute the image element so the drag ghost is tight to it.
            if (!(event.target instanceof HTMLElement) || !event.dataTransfer) {
              return false;
            }
            const image = event.target.closest(`.component-${this.name}`)?.querySelector("img");
            if (image) {
              const rect = image.getBoundingClientRect();
              event.dataTransfer.setDragImage(image, event.clientX - rect.left, event.clientY - rect.top);
            }
            return false;
          }
        },
        handleKeyDown: (view, event) => {
          // prevent prosemirror's default spacebar behavior
          // & zoom in if the selected node is image
          if (event.key === " ") {
            const {
              state
            } = view;
            const {
              selection
            } = state;
            if (selection instanceof _prosemirrorState.NodeSelection) {
              const {
                node
              } = selection;
              if (node.type.name === "image") {
                const image = view.dom.querySelector(".ProseMirror-selectednode img");
                image?.click();
                return true;
              }
            }
          }
          return false;
        }
      }
    })];
  }
  toMarkdown(state, node) {
    // Skip the preceding space for images at the start of a list item or Markdown parsers may
    // render them as code blocks
    let markdown = state.inList ? "" : " ";
    markdown += "![" + state.esc((node.attrs.alt || "").replace("\n", "") || "", false) + "](" + state.esc(node.attrs.src || "", false);
    let size = "";
    if (node.attrs.width || node.attrs.height) {
      size = ` =${state.esc(node.attrs.width ? String(node.attrs.width) : "", false)}x${state.esc(node.attrs.height ? String(node.attrs.height) : "", false)}`;
    }
    if (node.attrs.layoutClass) {
      markdown += ' "' + state.esc(node.attrs.layoutClass, false) + size + '"';
    } else if (node.attrs.title) {
      markdown += ' "' + state.esc(node.attrs.title, false) + size + '"';
    } else if (size) {
      markdown += ' "' + size + '"';
    }
    markdown += ")";
    state.write(markdown);
  }
  parseMarkdown() {
    return {
      node: "image",
      getAttrs: token => ({
        src: token.attrGet("src"),
        alt: token.content || null,
        ...parseTitleAttribute(token?.attrGet("title") || "")
      })
    };
  }
  keys() {
    return {
      ...super.keys(),
      "Mod-Alt-m": (0, _comment.addComment)({
        userId: this.options.userId
      })
    };
  }
  commands(_ref9) {
    let {
      type
    } = _ref9;
    return {
      ...super.commands({
        type
      }),
      downloadImage: () => state => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const {
          node
        } = state.selection;
        if (node.type.name !== "image") {
          return false;
        }
        void downloadImageNode(node);
        return true;
      },
      alignRight: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass: "right-50"
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignLeft: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass: "left-50"
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignFullWidth: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        let layoutClass = "full-width";
        if (state.selection.node.attrs.layoutClass === layoutClass) {
          layoutClass = null;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignCenter: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          layoutClass: null
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      resizeImage: _ref0 => {
        let {
          width,
          height
        } = _ref0;
        return (state, dispatch) => {
          if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
            return false;
          }
          const {
            selection
          } = state;
          const transformedAttrs = {
            ...state.selection.node.attrs,
            width,
            height
          };
          const tr = state.tr.setNodeMarkup(selection.from, undefined, transformedAttrs).setMeta("addToHistory", true);
          const $pos = tr.doc.resolve(selection.from);
          dispatch?.(tr.setSelection(new _prosemirrorState.NodeSelection($pos)));
          return true;
        };
      },
      commentOnImage: () => (0, _comment.addComment)({
        userId: this.options.userId
      }),
      linkOnImage: () => (0, _link.addLink)({
        href: ""
      })
    };
  }
  inputRules(_ref1) {
    let {
      type
    } = _ref1;
    /**
     * Matches following attributes in Markdown-typed image: [, alt, src, class]
     *
     * Example:
     * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
     * ![](image.jpg "class") -> [, "", "image.jpg", "small"]
     * ![Lorem](image.jpg "class") -> [, "Lorem", "image.jpg", "small"]
     */
    const IMAGE_INPUT_REGEX = /!\[(?<alt>[^\][]*?)]\((?<filename>[^\][]*?)(?=“|\))“?(?<layoutclass>[^\][”]+)?”?\)$/;
    return [new _prosemirrorInputrules.InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
      const [okay, alt, src, matchedTitle] = match;
      const {
        tr
      } = state;
      if (okay) {
        tr.replaceWith(start - 1, end, type.create({
          src,
          alt,
          ...parseTitleAttribute(matchedTitle)
        }));
      }
      return tr;
    })];
  }
}
exports.default = Image;