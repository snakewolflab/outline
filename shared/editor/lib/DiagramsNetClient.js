"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EMPTY_DIAGRAM_IMAGE = exports.DiagramsNetEvent = exports.DiagramsNetClient = exports.DiagramsNetAction = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Events sent by diagrams.net to the parent window.
 */
let DiagramsNetEvent = exports.DiagramsNetEvent = /*#__PURE__*/function (DiagramsNetEvent) {
  /** Editor is ready to receive commands. */
  DiagramsNetEvent["Init"] = "init";
  /** User clicked the save button. */
  DiagramsNetEvent["Save"] = "save";
  /** Diagram has been exported. */
  DiagramsNetEvent["Export"] = "export";
  /** Editor is closing. */
  DiagramsNetEvent["Exit"] = "exit";
  return DiagramsNetEvent;
}({});
/**
 * Actions that can be sent to diagrams.net.
 */
let DiagramsNetAction = exports.DiagramsNetAction = /*#__PURE__*/function (DiagramsNetAction) {
  /** Load a diagram from base64 encoded data with embedded XML. */
  DiagramsNetAction["Load"] = "load";
  /** Export the current diagram. */
  DiagramsNetAction["Export"] = "export";
  return DiagramsNetAction;
}({});
/**
 * Message format for communication with diagrams.net.
 */
/**
 * Handles communication with the diagrams.net editor window.
 *
 * This class manages the lifecycle of the diagrams.net popup window and
 * implements the message-passing protocol for loading and exporting diagrams.
 */
class DiagramsNetClient {
  /**
   * Creates a new DiagramsNetClient instance.
   *
   * @param onDiagramReady - callback when the editor is ready to receive commands.
   * @param onDiagramExported - callback when a diagram has been exported.
   */
  constructor(onDiagramReady, onDiagramExported) {
    this.onDiagramReady = onDiagramReady;
    this.onDiagramExported = onDiagramExported;
    _defineProperty(this, "window", null);
    /** The format to use when exporting diagrams. */
    _defineProperty(this, "format", "xmlsvg");
    /**
     * Loads a diagram from a data URI containing embedded XML.
     * Supports both PNG and SVG data URIs (e.g., "data:image/svg+xml;base64,...").
     *
     * @param dataUri - complete data URI with the diagram data.
     */
    _defineProperty(this, "loadDiagram", dataUri => {
      this.sendMessage({
        action: DiagramsNetAction.Load,
        xml: dataUri
      });
    });
    /**
     * Requests an export of the current diagram with embedded XML.
     * Uses the current format setting (xmlsvg or xmlpng).
     */
    _defineProperty(this, "exportDiagram", () => {
      this.sendMessage({
        action: DiagramsNetAction.Export,
        format: this.format,
        spinKey: "saving"
      });
    });
    /**
     * Sends a message to the diagrams.net window.
     *
     * @param message - the message to send.
     * @throws Error if the window is not open.
     */
    _defineProperty(this, "sendMessage", message => {
      if (!this.window) {
        throw new Error("Diagrams.net window is not open");
      }
      this.window.postMessage(JSON.stringify(message), "*");
    });
    /**
     * Handles incoming messages from the diagrams.net window.
     *
     * @param event - the message event.
     */
    _defineProperty(this, "handleMessage", event => {
      if (!event.data.length || event.source !== this.window) {
        return;
      }
      const message = JSON.parse(event.data);
      switch (message.event) {
        case DiagramsNetEvent.Init:
          this.onDiagramReady(this);
          break;
        case DiagramsNetEvent.Save:
          this.exportDiagram();
          break;
        case DiagramsNetEvent.Export:
          if (message.data) {
            this.onDiagramExported(message.data);
          }
          break;
        case DiagramsNetEvent.Exit:
          this.close();
          break;
      }
    });
  }

  /**
   * Opens the diagrams.net editor in a new window.
   *
   * @param url - the diagrams.net editor URL.
   */
  open(url) {
    if (this.window) {
      this.close();
    }
    window.addEventListener("message", this.handleMessage);
    this.window = window.open(url);
  }

  /**
   * Closes the editor window and cleans up event listeners.
   */
  close() {
    window.removeEventListener("message", this.handleMessage);
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }
}

/**
 * Base64 encoded empty diagram image (minimal SVG with embedded diagrams.net metadata).
 * The mxfile XML is embedded in the content attribute of the SVG.
 */
exports.DiagramsNetClient = DiagramsNetClient;
const EMPTY_DIAGRAM_IMAGE = exports.EMPTY_DIAGRAM_IMAGE = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxcHgiIGhlaWdodD0iMXB4IiB2aWV3Qm94PSItMC41IC0wLjUgMSAxIiBjb250ZW50PSIlM0NteGZpbGUlMjBob3N0JTNEJTIyYXBwLmRpYWdyYW1zLm5ldCUyMiUyMHNjYWxlJTNEJTIyMSUyMiUyMGJvcmRlciUzRCUyMjAlMjIlM0UlM0NkaWFncmFtJTIwbmFtZSUzRCUyMlBhZ2UtMSUyMiUyMGlkJTNEJTIyZW1wdHklMjIlM0UlM0NteEdyYXBoTW9kZWwlMjBkeCUzRCUyMjEwMDAlMjIlMjBkeSUzRCUyMjEwMDAlMjIlMjBncmlkJTNEJTIyMSUyMiUyMGdyaWRTaXplJTNEJTIyMTAlMjIlMjBndWlkZXMlM0QlMjIxJTIyJTIwdG9vbHRpcHMlM0QlMjIxJTIyJTIwY29ubmVjdCUzRCUyMjElMjIlMjBhcnJvd3MlM0QlMjIxJTIyJTIwZm9sZCUzRCUyMjElMjIlMjBwYWdlJTNEJTIyMSUyMiUyMHBhZ2VTY2FsZSUzRCUyMjElMjIlMjBwYWdlV2lkdGglM0QlMjI4NTAlMjIlMjBwYWdlSGVpZ2h0JTNEJTIyMTEwMCUyMiUyMG1hdGglM0QlMjIwJTIyJTIwc2hhZG93JTNEJTIyMCUyMiUzRSUzQ3Jvb3QlM0UlM0NteENlbGwlMjBpZCUzRCUyMjAlMjIlMkYlM0UlM0NteENlbGwlMjBpZCUzRCUyMjElMjIlMjBwYXJlbnQlM0QlMjIwJTIyJTJGJTNFJTNDJTJGcm9vdCUzRSUzQyUyRm14R3JhcGhNb2RlbCUzRSUzQyUyRmRpYWdyYW0lM0UlM0MlMkZteGZpbGUlM0UiLz4=";