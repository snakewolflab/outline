"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _FileHelper = _interopRequireWildcard(require("../lib/FileHelper"));
var _types = require("../../types");
var _DiagramsNetClient = require("../lib/DiagramsNetClient");
var _urls = require("../../utils/urls");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Tracks the mutable state for a single diagram editing session. Callbacks
 * close over a session object so that concurrent or overlapping sessions
 * do not interfere with each other.
 */

/**
 * An editor extension that adds commands to insert and edit diagrams using diagrams.net.
 *
 * This extension provides a command to open the diagrams.net editor for creating
 * and editing diagrams. Diagrams are stored as SVG or PNG images with embedded XML data
 * that allows them to be re-edited later.
 */
class Diagrams extends _Extension.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "client", void 0);
  }
  get name() {
    return "diagrams";
  }
  commands() {
    return {
      editDiagram: () => (state, dispatch) => {
        if (!dispatch) {
          return true;
        }
        const selectedNode = this.getSelectedImageNode(state);
        if (!selectedNode) {
          this.insertEmptyDiagram(state, dispatch);
        }
        this.openDiagramEditor(selectedNode);
        return true;
      }
    };
  }

  /**
   * Gets the currently selected image node if it exists.
   *
   * @param state - the editor state.
   * @returns the selected image node or undefined.
   */
  getSelectedImageNode(state) {
    if (state.selection instanceof _prosemirrorState.NodeSelection) {
      const node = state.selection.node;
      if (node.type.name === "image") {
        return node;
      }
    }
    return;
  }

  /**
   * Inserts an empty diagram placeholder at the current cursor position.
   *
   * @param state - the editor state.
   * @param dispatch - the dispatch function.
   */
  insertEmptyDiagram(state, dispatch) {
    const type = this.editor.schema.nodes.image;
    const {
      tr
    } = state;
    const transaction = tr.insert(state.selection.from, type.create({
      src: "",
      source: _FileHelper.ImageSource.DiagramsNet
    }));
    dispatch(transaction);
  }

  /**
   * Opens the diagram editor for creating or editing a diagram.
   *
   * @param node - the selected image node, if any.
   */
  openDiagramEditor(node) {
    const nodeSrc = node?.attrs.src ?? "";
    const sourceUrl = nodeSrc || _DiagramsNetClient.EMPTY_DIAGRAM_IMAGE;

    // Create a per-session object. Async callbacks close over this object so
    // that a second editing session does not clobber the first session's state.
    // Format defaults to SVG and is updated after fetching the actual content.
    const session = {
      nodeSrc,
      format: "xmlsvg"
    };

    // Clean up any existing client
    if (this.client) {
      this.client.close();
    }
    this.client = new _DiagramsNetClient.DiagramsNetClient(client => this.onDiagramReady(client, sourceUrl, session), base64Data => this.onDiagramExported(base64Data, session));
    this.client.open(this.getDiagramsNetUrl());
  }

  /**
   * Called when the diagram editor is ready to receive commands.
   *
   * @param client - the DiagramsNetClient that fired the ready event.
   * @param sourceUrl - the URL of the diagram to load, or the empty diagram constant.
   * @param session - the editing session to update with the detected format.
   */
  async onDiagramReady(client, sourceUrl, session) {
    let data;
    if (sourceUrl === _DiagramsNetClient.EMPTY_DIAGRAM_IMAGE) {
      // For empty diagram, send full data URI
      data = `data:image/svg+xml;base64,${_DiagramsNetClient.EMPTY_DIAGRAM_IMAGE}`;
    } else {
      // For existing diagrams, send the full data URI
      data = await _FileHelper.default.urlToBase64(sourceUrl);
    }

    // Detect format from the data URI now that we have the actual content.
    const format = data.startsWith("data:image/png") ? "xmlpng" : "xmlsvg";
    session.format = format;
    client.format = format;
    client.loadDiagram(data);
  }

  /**
   * Called when a diagram has been exported from the editor.
   *
   * @param base64Data - the exported diagram as base64 encoded SVG or PNG.
   * @param session - the editing session that produced this export.
   */
  async onDiagramExported(base64Data, session) {
    try {
      // Use the format from the session to create the appropriate file
      const isPng = session.format === "xmlpng";
      const filename = isPng ? "diagram.png" : "diagram.svg";
      const mimeType = isPng ? "image/png" : "image/svg+xml";
      const file = _FileHelper.default.base64ToFile(base64Data, filename, mimeType);
      const dimensions = await _FileHelper.default.getImageDimensions(file);
      const uploadedUrl = await this.uploadDiagramFile(file);

      // Capture the src we need to search for *before* updating the session,
      // then update the document and the session atomically.
      const srcToFind = session.nodeSrc;
      this.updateDiagramInDocument(uploadedUrl, dimensions || {}, srcToFind);

      // Update session so that subsequent saves within the same editing session
      // can locate the node by its new uploaded URL.
      session.nodeSrc = uploadedUrl;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to export diagram:", error);
    }
  }

  /**
   * Uploads the diagram file using the editor's upload handler.
   *
   * @param file - the diagram file to upload.
   * @returns promise resolving to the uploaded file URL.
   * @throws Error if no upload handler is configured.
   */
  async uploadDiagramFile(file) {
    const {
      uploadFile
    } = this.editor.props;
    if (!uploadFile) {
      throw new Error("No upload handler configured");
    }
    return uploadFile(file);
  }

  /**
   * Updates or inserts the diagram image in the document. Always reads fresh
   * editor state at call-time so that positions are accurate even after async
   * gaps.
   *
   * @param uploadedUrl - the URL of the uploaded diagram.
   * @param dimensions - the image dimensions.
   * @param srcToFind - the src attribute value to search for in the document.
   */
  updateDiagramInDocument(uploadedUrl, dimensions, srcToFind) {
    // Read fresh state at the moment of dispatch to avoid stale positions.
    const {
      state
    } = this.editor.view;
    const {
      dispatch
    } = this.editor.view;
    const imageType = this.editor.schema.nodes.image;

    // Try to find and update the existing node by its current src attribute.
    const existingNode = this.findImageNodeBySrc(state, srcToFind);
    const attrs = {
      ...dimensions,
      src: uploadedUrl,
      source: _FileHelper.ImageSource.DiagramsNet
    };
    if (existingNode) {
      dispatch(state.tr.setNodeMarkup(existingNode.pos, undefined, {
        ...existingNode.node.attrs,
        ...attrs
      }));
    } else {
      const imageNode = imageType.create(attrs);
      const transaction = state.tr.insert(state.selection.from, imageNode);
      dispatch(transaction);
    }
  }

  /**
   * Finds an image node in the document by its src attribute.
   *
   * @param state - the editor state.
   * @param src - the image source URL to search for.
   * @returns the node and its position, or undefined.
   */
  findImageNodeBySrc(state, src) {
    let foundNode;
    state.doc.descendants((node, pos) => {
      if (node.attrs.src === src && node.type.name === "image") {
        foundNode = {
          node,
          pos
        };
        return false; // Stop searching
      }
      return true;
    });
    return foundNode;
  }

  /**
   * Gets the configured diagrams.net URL or returns the default.
   *
   * @returns the diagrams.net editor URL.
   */
  getDiagramsNetUrl() {
    const integration = this.editor.props.embeds?.find(integ => integ.name === _types.IntegrationService.Diagrams);
    const uiTheme = this.editor.props.theme.isDark ? "dark" : "atlas";
    return (0, _urls.sanitizeUrl)(integration?.settings?.diagrams?.url ?? "https://embed.diagrams.net/") + `?embed=1&ui=${uiTheme}&spin=1&modified=unsavedChanges&proto=json`;
  }
}
exports.default = Diagrams;