"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var Sentry = _interopRequireWildcard(require("@sentry/react"));
var _i18next = require("i18next");
var _uuid = require("uuid");
var _sonner = require("sonner");
var _FileHelper = _interopRequireDefault(require("../lib/FileHelper"));
var _uploadPlaceholder = _interopRequireWildcard(require("../lib/uploadPlaceholder"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const insertFiles = async function (view, event, pos, files, options) {
  const {
    uploadFile,
    onFileUploadStart,
    onFileUploadStop,
    onFileUploadProgress
  } = options;

  // okay, we have some dropped files and a handler – lets stop this
  // event going any further up the stack
  event.preventDefault();

  // let the user know we're starting to process the files
  onFileUploadStart?.();
  const {
    schema
  } = view.state;

  // we'll use this to track of how many files have succeeded or failed
  let complete = 0;
  const filesToUpload = (await Promise.all(files.map(async file => {
    const isImage = _FileHelper.default.isImage(file.type) && !options.isAttachment && !!schema.nodes.image;
    const isVideo = _FileHelper.default.isVideo(file.type) && !options.isAttachment && !!schema.nodes.video;

    // a file that cannot be inserted as an image or video falls back to an
    // attachment node – if the schema in use has none then it cannot be
    // represented at all and should be skipped.
    if (!isImage && !isVideo && !schema.nodes.attachment) {
      return undefined;
    }
    const getDimensions = isImage ? f => _FileHelper.default.getImageDimensions(f) : isVideo ? f => _FileHelper.default.getVideoDimensions(f) : undefined;
    return {
      id: (0, _uuid.v4)(),
      dimensions: await getDimensions?.(file),
      source: await _FileHelper.default.getImageSourceAttr(file),
      isImage,
      isVideo,
      file
    };
  }))).filter(upload => upload !== undefined);

  // none of the dropped files can be represented in this schema, nothing to do
  if (filesToUpload.length === 0) {
    onFileUploadStop?.();
    return;
  }

  // the user might have dropped multiple files at once, we need to loop
  for (const upload of filesToUpload) {
    const {
      tr
    } = view.state;
    tr.setMeta(_uploadPlaceholder.default, {
      add: {
        pos,
        ...upload,
        replaceExisting: options.replaceExisting
      }
    });
    view.dispatch(tr);

    // start uploading the file to the server. Using "then" syntax
    // to allow all placeholders to be entered at once with the uploads
    // happening in the background in parallel.
    uploadFile?.(upload.file, {
      id: upload.id,
      onProgress: progress => onFileUploadProgress?.(upload.id, progress)
    })
    // then this should be able to get the full URL as well
    .then(async src => {
      if (view.isDestroyed) {
        return;
      }
      if (upload.isImage) {
        const newImg = new Image();
        newImg.onload = async () => {
          const result = (0, _uploadPlaceholder.findPlaceholder)(view.state, upload.id);
          if (result === null) {
            return;
          }
          if (view.isDestroyed) {
            return;
          }
          const [from, to] = result;
          view.dispatch(view.state.tr.replaceWith(from, to || from, schema.nodes.image.create({
            src,
            source: upload.source,
            ...(upload.dimensions ?? {}),
            ...options.attrs
          })).setMeta(_uploadPlaceholder.default, {
            remove: {
              id: upload.id
            }
          }));
        };
        newImg.onerror = () => {
          throw new Error(`Error loading image: ${src}`);
        };
        newImg.src = src;
      } else if (upload.isVideo) {
        const result = (0, _uploadPlaceholder.findPlaceholder)(view.state, upload.id);
        if (result === null) {
          return;
        }
        const [from, to] = result;
        if (view.isDestroyed) {
          return;
        }
        view.dispatch(view.state.tr.replaceWith(from, to || from, schema.nodes.video.create({
          src,
          title: upload.file.name ?? (0, _i18next.t)("Untitled"),
          ...upload.dimensions,
          ...options.attrs
        })).setMeta(_uploadPlaceholder.default, {
          remove: {
            id: upload.id
          }
        }));
      } else {
        const result = (0, _uploadPlaceholder.findPlaceholder)(view.state, upload.id);
        if (result === null) {
          return;
        }
        const [from, to] = result;
        view.dispatch(view.state.tr.replaceWith(from, to || from, schema.nodes.attachment.create({
          href: src,
          title: upload.file.name ?? (0, _i18next.t)("Untitled"),
          size: upload.file.size,
          contentType: upload.file.type,
          preview: false,
          ...options.attrs
        })).setMeta(_uploadPlaceholder.default, {
          remove: {
            id: upload.id
          }
        }));
      }
    }).catch(error => {
      Sentry.captureException(error);

      // oxlint-disable-next-line no-console
      console.error(error);
      if (view.isDestroyed) {
        return;
      }

      // cleanup the placeholder if there is a failure
      view.dispatch(view.state.tr.setMeta(_uploadPlaceholder.default, {
        remove: {
          id: upload.id
        }
      }));
      _sonner.toast.error(error.message || (0, _i18next.t)("Sorry, an error occurred uploading the file"));
    }).finally(() => {
      complete++;

      // once everything is done, let the user know
      if (complete === filesToUpload.length && onFileUploadStop) {
        onFileUploadStop();
      }
    });
  }
};
var _default = exports.default = insertFiles;