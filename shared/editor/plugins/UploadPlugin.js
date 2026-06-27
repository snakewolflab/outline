"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UploadPlugin = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _files = require("../../utils/files");
var _urls = require("../../utils/urls");
var _insertFiles = _interopRequireDefault(require("../commands/insertFiles"));
var _FileHelper = _interopRequireDefault(require("../lib/FileHelper"));
var _uploadPlaceholder = _interopRequireWildcard(require("../lib/uploadPlaceholder"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class UploadPlugin extends _prosemirrorState.Plugin {
  constructor(options) {
    super({
      props: {
        handleDOMEvents: {
          paste(view, event) {
            if (!view.editable || !options.uploadFile) {
              return false;
            }
            if (!event.clipboardData) {
              return false;
            }

            // check if we actually pasted any files
            const files = (0, _files.getDataTransferFiles)(event);
            if (files.length === 0) {
              return false;
            }

            // When copying from Microsoft Office product the clipboard contains
            // an image version of the content, check if there is also text and
            // use that instead in this scenario.
            const html = event.clipboardData.getData("text/html");

            // Fallback to default paste behavior if the clipboard contains HTML
            // Even if there is an image, it's likely to be a screenshot from eg
            // Microsoft Suite / Apple Numbers – and not the original content.
            if (html.length && !(0, _files.getDataTransferImage)(event)) {
              return false;
            }
            const {
              tr
            } = view.state;
            if (!tr.selection.empty) {
              tr.deleteSelection();
            }
            const pos = tr.selection.from;
            void (0, _insertFiles.default)(view, event, pos, files, options);
            return true;
          },
          drop(view, event) {
            if (!view.editable || !options.uploadFile) {
              return false;
            }

            // grab the position in the document for the cursor
            const result = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });
            if (!result) {
              return false;
            }
            const files = (0, _files.getDataTransferFiles)(event);
            if (files.length) {
              void (0, _insertFiles.default)(view, event, result.pos, files, options);
              return true;
            }
            const imageSrc = (0, _files.getDataTransferImage)(event);
            if (imageSrc && !(0, _urls.isInternalUrl)(imageSrc)) {
              event.stopPropagation();
              event.preventDefault();
              void fetch(imageSrc).then(response => response.blob()).then(blob => {
                const fileName = (0, _urls.fileNameFromUrl)(imageSrc) ?? "pasted-image";
                void (0, _insertFiles.default)(view, event, result.pos, [new File([blob], fileName, {
                  type: blob.type
                })], options);
              });
            }
            return false;
          }
        },
        transformPasted: (slice, view) => {
          const uploads = [];
          const mapNode = node => {
            if (node.type.name === "image" && node.attrs.src && !(0, _urls.isInternalUrl)(node.attrs.src)) {
              const id = (0, _uuid.v4)();
              const redirectUrl = `/api/attachments.redirect?id=${id}`;
              uploads.push({
                originalSrc: node.attrs.src,
                searchSrc: redirectUrl,
                id
              });
              return node.type.create({
                ...node.attrs,
                src: redirectUrl
              });
            }
            if (node.content.size > 0) {
              const nodes = [];
              node.content.forEach(child => {
                nodes.push(mapNode(child));
              });
              return node.copy(_prosemirrorModel.Fragment.from(nodes));
            }
            return node;
          };
          const nodes = [];
          slice.content.forEach(node => {
            nodes.push(mapNode(node));
          });
          const newContent = _prosemirrorModel.Fragment.from(nodes);

          // We need to wait for the pasted content to be inserted before we can
          // find the nodes and replace them with placeholders.
          setTimeout(() => {
            void Promise.all(uploads.map(async upload => {
              if (view.isDestroyed) {
                return;
              }
              const {
                state
              } = view;
              let pos = -1;
              let nodeSize = 0;
              let attrs = {};
              let existingDimensions;
              state.doc.nodesBetween(0, state.doc.nodeSize - 2, (node, nodePos) => {
                if (node.type.name === "image" && node.attrs.src === upload.searchSrc) {
                  pos = nodePos;
                  nodeSize = node.nodeSize;
                  attrs = node.attrs;
                  if (node.attrs.width || node.attrs.height) {
                    existingDimensions = {
                      width: node.attrs.width,
                      height: node.attrs.height
                    };
                  }
                  return false;
                }
                return true;
              });
              if (pos !== -1) {
                const isBase64 = upload.originalSrc.startsWith("data:");
                const file = isBase64 ? (0, _files.dataUrlToFile)(upload.originalSrc, "pasted-image") : undefined;
                const dimensions = (isBase64 && file ? await _FileHelper.default.getImageDimensions(file) : undefined) ?? existingDimensions;
                if (view.isDestroyed) {
                  return;
                }

                // The position may have changed while we were awaiting dimensions
                let currentPos = -1;
                view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, nodePos) => {
                  if (node.type.name === "image" && node.attrs.src === upload.searchSrc) {
                    currentPos = nodePos;
                    return false;
                  }
                  return true;
                });
                if (currentPos !== -1) {
                  view.dispatch(view.state.tr.setMeta(_uploadPlaceholder.default, {
                    add: {
                      id: upload.id,
                      file,
                      src: isBase64 ? undefined : upload.originalSrc,
                      pos: currentPos,
                      isImage: true,
                      dimensions
                    }
                  }).delete(currentPos, currentPos + nodeSize));
                }
              }
              const url = await options.uploadFile?.(upload.originalSrc, {
                id: upload.id
              });
              if (view.isDestroyed) {
                return;
              }
              if (url) {
                const file = await _FileHelper.default.getFileForUrl(url);
                const dimensions = await _FileHelper.default.getImageDimensions(file);
                const result = (0, _uploadPlaceholder.findPlaceholder)(view.state, upload.id);
                if (result) {
                  const [from, to] = result;
                  view.dispatch(view.state.tr.replaceWith(from, to || from, view.state.schema.nodes.image.create({
                    ...attrs,
                    ...dimensions,
                    src: url
                  })).setMeta(_uploadPlaceholder.default, {
                    remove: {
                      id: upload.id
                    }
                  }));
                }
              }
            }));
          }, 0);
          return new _prosemirrorModel.Slice(newContent, slice.openStart, slice.openEnd);
        }
      }
    });
  }
}
exports.UploadPlugin = UploadPlugin;