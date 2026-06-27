"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProsemirrorHelper = void 0;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _compat = require("es-toolkit/compat");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _prosemirrorModel = require("prosemirror-model");
var _server = require("react-dom/server");
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _error = require("../../../shared/utils/error");
var _Diff = _interopRequireDefault(require("../../../shared/editor/extensions/Diff"));
var _EditorStyleHelper = require("../../../shared/editor/styles/EditorStyleHelper");
var _textBetween = _interopRequireDefault(require("../../../shared/editor/lib/textBetween"));
var _trailingNode = require("../../../shared/editor/lib/trailingNode");
var _Styles = _interopRequireDefault(require("../../../shared/editor/components/Styles"));
var _globals = _interopRequireDefault(require("../../../shared/styles/globals"));
var _theme = _interopRequireDefault(require("../../../shared/styles/theme"));
var _types = require("../../../shared/types");
var _ProsemirrorHelper2 = require("../../../shared/utils/ProsemirrorHelper");
var _parseDocumentSlug = _interopRequireDefault(require("../../../shared/utils/parseDocumentSlug"));
var _rtl = require("../../../shared/utils/rtl");
var _urls = require("../../../shared/utils/urls");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _editor = require("../../editor");
var _env = _interopRequireDefault(require("../../env"));
var _errors = require("../../errors");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _tracing = require("../../logging/tracing");
var _Attachment = _interopRequireDefault(require("../Attachment"));
var _User = _interopRequireDefault(require("../User"));
var _files = _interopRequireDefault(require("../../storage/files"));
var _jsxRuntime = require("react/jsx-runtime");
var _dec, _class, _ProsemirrorHelper;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const pluginsWithSafeDecorations = new WeakSet();
function isDecorationSource(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("forChild" in value) || typeof value.forChild !== "function") {
    return false;
  }
  if ("members" in value && Array.isArray(value.members)) {
    return value.members.every(member => typeof member === "object" && member !== null && "localsInner" in member && typeof member.localsInner === "function");
  }
  return true;
}
let ProsemirrorHelper = exports.ProsemirrorHelper = (_dec = (0, _tracing.trace)(), _dec(_class = (_ProsemirrorHelper = class ProsemirrorHelper extends _ProsemirrorHelper2.ProsemirrorHelper {
  /**
   * Returns the input text as a Y.Doc.
   *
   * @param markdown The text to parse
   * @returns The content as a Y.Doc.
   */
  static toYDoc(input) {
    let fieldName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";
    const node = typeof input === "object" ? ProsemirrorHelper.toProsemirror(input) : _editor.parser.parse(input);
    if (!node) {
      return new Y.Doc();
    }
    // Normalize to the editor's trailing-node form so the document opens without
    // the editor inserting a trailing paragraph, which would be a spurious edit.
    return (0, _yProsemirror.prosemirrorToYDoc)((0, _trailingNode.withTrailingNode)(node), fieldName);
  }

  /**
   * Returns the input Y.Doc encoded as a YJS state update.
   *
   * @param ydoc The Y.Doc to encode
   * @returns The content as a YJS state update
   */
  static toState(ydoc) {
    return Buffer.from(Y.encodeStateAsUpdate(ydoc));
  }

  /**
   * Converts a plain object or Markdown string into a Prosemirror Node.
   *
   * @param data The ProsemirrorData object or string to parse.
   * @returns The content as a Prosemirror Node
   */
  static toProsemirror(data) {
    if (typeof data === "string") {
      return _editor.parser.parse(data);
    }
    return _prosemirrorModel.Node.fromJSON(_editor.schema, data);
  }

  /**
   * Returns an array of attributes of all mentions in the node.
   *
   * @param node The node to parse mentions from
   * @param options Attributes to use for filtering mentions
   * @returns An array of mention attributes
   */
  static parseMentions(doc, options) {
    const mentions = [];
    const seenIds = new Set();
    doc.descendants(node => {
      if (node.type.name === "mention") {
        if (!(options?.type && options.type !== node.attrs.type) && !(options?.modelId && options.modelId !== node.attrs.modelId) && !seenIds.has(node.attrs.id)) {
          seenIds.add(node.attrs.id);
          mentions.push(node.attrs);
        }
        return false;
      }
      if (!node.content.size) {
        return false;
      }
      return true;
    });
    return mentions;
  }

  /**
   * Returns an array of document IDs referenced through links or mentions in the node.
   *
   * @param node The node to parse document IDs from
   * @returns An array of document IDs
   */
  static parseDocumentIds(doc) {
    const seen = new Set();
    const identifiers = [];
    doc.descendants(node => {
      if (node.type.name === "mention" && node.attrs.type === _types.MentionType.Document && !seen.has(node.attrs.modelId)) {
        seen.add(node.attrs.modelId);
        identifiers.push(node.attrs.modelId);
        return true;
      }
      if (node.type.name === "text") {
        for (const mark of node.marks) {
          if (mark.type.name === "link") {
            const slug = (0, _parseDocumentSlug.default)(mark.attrs.href);
            if (slug && !seen.has(slug)) {
              seen.add(slug);
              identifiers.push(slug);
            }
          }
        }
      }
      if (!node.content.size) {
        return false;
      }
      return true;
    });
    return identifiers;
  }

  /**
   * Build an email snippet around a mention. A surrounding list is trimmed to
   * the mentioned item plus one sibling on either side, a table to the
   * mentioned row; otherwise the largest complete block that still fits the
   * size budget is kept.
   *
   * @param doc The top-level doc node of a document / revision.
   * @param mention The mention to build the snippet around.
   * @returns A new top-level doc node with the chosen block as its only child,
   * or undefined if the mention could not be found.
   */
  static getNodeForMentionEmail(doc, mention) {
    // A mention is an inline node, so it always lives inside a textblock
    // (paragraph or heading). Locate it once and resolve its position.
    let mentionPos;
    doc.descendants((node, pos) => {
      if (mentionPos !== undefined) {
        return false;
      }
      if (node.type.name === "mention" && (0, _compat.isMatch)(node.attrs, mention)) {
        mentionPos = pos;
        return false;
      }
      return true;
    });
    if (mentionPos === undefined) {
      return undefined;
    }
    const $pos = doc.resolve(mentionPos);

    // Lists and tables can be long, so rather than show the whole container,
    // trim a list to the mentioned item plus one sibling on either side, and a
    // table to the mentioned row. Use the nearest such ancestor so nested
    // structures show the content closest to the mention.
    const listTypes = ["bullet_list", "ordered_list", "checkbox_list"];
    for (let d = $pos.depth - 1; d >= 1; d--) {
      const container = $pos.node(d);
      const name = container.type.name;
      if (listTypes.includes(name)) {
        const index = $pos.index(d);
        const start = Math.max(0, index - 1);
        const end = Math.min(container.childCount, index + 2);
        const items = [];
        for (let i = start; i < end; i++) {
          items.push(container.child(i));
        }
        // Keep an ordered list's numbering aligned with the original document
        // by advancing its start to match the first item shown.
        const attrs = name === "ordered_list" && start > 0 ? {
          ...container.attrs,
          order: (container.attrs.order ?? 1) + start
        } : container.attrs;
        const trimmed = container.type.create(attrs, _prosemirrorModel.Fragment.fromArray(items), container.marks);
        return doc.copy(_prosemirrorModel.Fragment.fromArray([trimmed]));
      }
      if (name === "table") {
        const row = container.child($pos.index(d));
        return doc.copy(_prosemirrorModel.Fragment.fromArray([container.copy(_prosemirrorModel.Fragment.fromArray([row]))]));
      }
    }

    // Always include at least the textblock the mention sits in, then climb the
    // ancestor chain outward keeping the largest complete block that still fits
    // the size budget. Each ancestor strictly contains the previous, so sizes
    // grow monotonically and we can stop at the first that overflows.
    let node = $pos.node($pos.depth);
    for (let d = $pos.depth - 1; d >= 1; d--) {
      const ancestor = $pos.node(d);
      // textBetween rather than textContent so leaf text (mentions, etc.) is
      // counted towards the budget.
      const length = (0, _textBetween.default)(ancestor, 0, ancestor.content.size).length;
      if (length > ProsemirrorHelper.mentionEmailMaxChars) {
        break;
      }
      node = ancestor;
    }

    // Return a new top-level "doc" node to maintain structure during serialization.
    return doc.copy(_prosemirrorModel.Fragment.fromArray([node]));
  }
  static async replaceInternalUrls(doc, basePath) {
    const json = "toJSON" in doc ? doc.toJSON() : doc;
    if (basePath.endsWith("/")) {
      throw new Error("internalUrlBase must not end with a slash");
    }
    function replaceUrl(url) {
      // Only replace if the URL starts with /doc/ (or) /collection/ (not already in a share path)
      if (url.startsWith("/doc/") || url.startsWith("/collection/")) {
        return `${basePath}${url}`;
      }
      return url;
    }
    function replaceInternalUrlsInner(node) {
      if (typeof node.attrs?.href === "string") {
        node.attrs.href = replaceUrl(node.attrs.href);
      } else if (node.marks) {
        node.marks.forEach(mark => {
          if (typeof mark.attrs?.href === "string" && (0, _urls.isInternalUrl)(mark.attrs?.href)) {
            mark.attrs.href = replaceUrl(mark.attrs.href);
          }
        });
      }
      if (node.content) {
        node.content.forEach(replaceInternalUrlsInner);
      }
      return node;
    }
    return replaceInternalUrlsInner(json);
  }

  /**
   * Returns the document as a plain JSON object with attachment URLs signed.
   *
   * @param node The node to convert to JSON
   * @param teamId The team ID to use for signing
   * @param expiresIn The number of seconds until the signed URL expires
   * @returns The content as a JSON object
   */
  static async signAttachmentUrls(doc, teamId) {
    let expiresIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60;
    const attachmentIds = ProsemirrorHelper.parseAttachmentIds(doc);
    const attachments = await _Attachment.default.findAll({
      where: {
        id: attachmentIds,
        teamId
      }
    });
    const mapping = new Map();
    await Promise.all(attachments.map(async attachment => {
      const signedUrl = await _files.default.getSignedUrl(attachment.key, expiresIn);
      mapping.set(attachment.redirectUrl, signedUrl);
    }));
    const json = doc.toJSON();
    function toRelativeHref(href) {
      try {
        const url = new URL(href);
        return url.toString().substring(url.origin.length);
      } catch {
        return undefined;
      }
    }
    function getMapping(href) {
      const signedUrl = mapping.get(href);
      if (signedUrl) {
        return signedUrl;
      }
      const relativeHref = toRelativeHref(href);
      if (relativeHref) {
        const signedUrl = mapping.get(relativeHref);
        if (signedUrl) {
          return signedUrl;
        }
      }

      // Extract attachment ID from URLs that may have extra query params
      // (e.g. /api/attachments.redirect?id=<uuid>&size=2)
      const regex = new RegExp(_ProsemirrorHelper2.attachmentRedirectRegex.source, "i");
      const match = regex.exec(relativeHref ?? href);
      if (match?.groups?.id) {
        const canonicalUrl = `/api/attachments.redirect?id=${match.groups.id}`;
        const signedUrl = mapping.get(canonicalUrl);
        if (signedUrl) {
          return signedUrl;
        }
      }
      return href;
    }
    function replaceAttachmentUrls(node) {
      if (node.attrs?.src) {
        node.attrs.src = getMapping(node.attrs.src);
      } else if (node.attrs?.href) {
        node.attrs.href = getMapping(node.attrs.href);
      } else if (node.marks) {
        node.marks.forEach(mark => {
          if (mark.attrs?.href) {
            mark.attrs.href = getMapping(mark.attrs.href);
          }
        });
      }
      if (node.content) {
        node.content.forEach(replaceAttachmentUrls);
      }
      return node;
    }
    return replaceAttachmentUrls(json);
  }

  /**
   * Returns an array of attachment IDs in the node.
   *
   * @param node The node to parse attachments from
   * @returns An array of attachment IDs
   */
  static parseAttachmentIds(doc) {
    const urls = [];
    doc.descendants(node => {
      for (const mark of node.marks) {
        if (mark.type.name === "link" && mark.attrs.href) {
          urls.push(mark.attrs.href);
        }
      }
      if ((node.type.name === "image" || node.type.name === "video") && node.attrs.src) {
        urls.push(node.attrs.src);
      } else if (node.type.name === "attachment" && node.attrs.href) {
        urls.push(node.attrs.href);
      }
    });
    const ids = new Set();
    for (const url of urls) {
      for (const match of url.matchAll(_ProsemirrorHelper2.attachmentRedirectRegex)) {
        if (match.groups?.id) {
          ids.add(match.groups.id);
        }
      }
    }
    return [...ids];
  }

  /**
   * Returns the node as HTML. This is a lossy conversion and should only be used
   * for export.
   *
   * @param node The node to convert to HTML
   * @param options Options for the HTML output
   * @returns The content as a HTML string
   */
  static async toHTML(node, options) {
    let view;
    let cleanupEnv;

    // Loaded lazily to keep jsdom off the startup path — only HTML export needs it.
    const {
      JSDOM
    } = await Promise.resolve().then(() => _interopRequireWildcard(require("jsdom")));
    try {
      const sheet = new _styledComponents.ServerStyleSheet();
      let html = "";
      let styleTags = "";
      const Centered = options?.centered ? _styledComponents.default.article.withConfig({
        componentId: "sc-1aoph8b-0"
      })(["max-width:calc( ", " + ", " );margin:0 auto;padding:0 1em;"], _EditorStyleHelper.EditorStyleHelper.documentWidth, _EditorStyleHelper.EditorStyleHelper.documentGutter) : "article";
      const rtl = (0, _rtl.isRTL)(node.textBetween(0, Math.min(node.content.size, 100)));
      const content = /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        id: "content",
        className: "ProseMirror exported"
      });
      const children = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [options?.title && /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
          dir: rtl ? "rtl" : "ltr",
          children: options.title
        }), options?.includeStyles !== false ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Styles.default, {
          dir: rtl ? "rtl" : "ltr",
          $rtl: rtl,
          staticHTML: true,
          children: content
        }) : content]
      });

      // First render the containing document which has all the editor styles,
      // global styles, layout and title.
      try {
        html = (0, _server.renderToString)(sheet.collectStyles(/*#__PURE__*/(0, _jsxRuntime.jsx)(_styledComponents.ThemeProvider, {
          theme: _theme.default,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
            children: options?.includeStyles === false ? /*#__PURE__*/(0, _jsxRuntime.jsx)("article", {
              children: children
            }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_globals.default, {
                staticHTML: true
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Centered, {
                children: children
              })]
            })
          })
        })));
        styleTags = sheet.getStyleTags();
      } catch (error) {
        _Logger.default.error("Failed to render styles on node HTML conversion", (0, _error.toError)(error));
      } finally {
        sheet.seal();
      }

      // Render the Prosemirror document using virtual DOM and serialize the
      // result to a string
      const dom = new JSDOM(`<!DOCTYPE html><meta charset="utf-8">${options?.includeStyles === false ? "" : styleTags}${html}`);
      const doc = dom.window.document;
      const target = doc.getElementById("content");
      cleanupEnv = this.patchGlobalEnv(dom.window);
      const diffPlugins = options?.changes ? new _Diff.default({
        changes: options.changes
      }).plugins : [];
      const editorPlugins = [..._editor.plugins, ...diffPlugins];
      for (const plugin of _editor.plugins) {
        if (!plugin.props.decorations || pluginsWithSafeDecorations.has(plugin)) {
          continue;
        }
        plugin.props.decorations = () => _prosemirrorView.DecorationSet.empty;
        pluginsWithSafeDecorations.add(plugin);
      }
      for (const plugin of diffPlugins) {
        if (!plugin.props.decorations || pluginsWithSafeDecorations.has(plugin)) {
          continue;
        }
        const decorations = plugin.props.decorations.bind(plugin);
        plugin.props.decorations = state => {
          const result = decorations(state);
          return isDecorationSource(result) ? result : _prosemirrorView.DecorationSet.empty;
        };
        pluginsWithSafeDecorations.add(plugin);
      }
      const state = _prosemirrorState.EditorState.create({
        doc: node,
        plugins: editorPlugins,
        schema: _editor.schema
      });
      view = new _prosemirrorView.EditorView({
        mount: target
      }, {
        state,
        editable: () => false
      });

      // Convert relative urls to absolute
      if (options?.baseUrl) {
        const elements = doc.querySelectorAll("a[href]");
        for (const el of elements) {
          if ("href" in el && el.href.startsWith("/")) {
            el.href = new URL(el.href, options.baseUrl).toString();
          }
        }
      }

      // Inject mermaidjs scripts if the document contains mermaid diagrams (supports both "mermaid" and "mermaidjs")
      if (options?.includeMermaid) {
        const mermaidElements = dom.window.document.querySelectorAll(`[data-language="mermaid"] pre code, [data-language="mermaidjs"] pre code`);

        // Unwrap <pre> tags to enable Mermaid script to correctly render inner content
        for (const el of mermaidElements) {
          const parent = el.parentNode;
          if (parent) {
            while (el.firstChild) {
              parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
            parent.setAttribute("class", "mermaid");
          }
        }
        const element = dom.window.document.createElement("script");
        element.setAttribute("type", "module");
        if (options?.cspNonce) {
          element.setAttribute("nonce", options.cspNonce);
        }

        // Inject Mermaid script
        if (mermaidElements.length) {
          element.innerHTML = `
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
          import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs';
          mermaid.registerLayoutLoaders(elkLayouts);
          mermaid.initialize({
            startOnLoad: true,
            fontFamily: "inherit",
          });
          window.status = "ready";
        `;
        } else {
          element.innerHTML = `
          window.status = "ready";
        `;
        }
        dom.window.document.body.appendChild(element);
      }
      const output = dom.serialize();
      if (options?.includeHead === false) {
        // replace everything upto and including "<body>"
        const body = "<body>";
        const bodyIndex = output.indexOf(body) + body.length;
        if (bodyIndex !== -1) {
          return output.substring(bodyIndex).replace("</body>", "").replace("</html>", "");
        }
      }
      return output;
    } finally {
      try {
        view?.destroy();
      } catch (err) {
        _Logger.default.error("Error destroying ProseMirror view", (0, _error.toError)(err));
      }
      cleanupEnv?.();
    }
  }

  /**
   * Processes mentions in the Prosemirror data, ensuring that mentions
   * for deleted users are displayed as "@unknown" and updated names are
   * displayed correctly.
   *
   * @param data The ProsemirrorData object to process
   * @returns The processed ProsemirrorData with updated mentions
   */
  static async processMentions(data) {
    const json = "toJSON" in data ? data.toJSON() : data;

    // First pass: collect all user IDs from mentions
    const userIds = [];
    function collectUserIds(node) {
      if (node.type === "mention" && node.attrs?.type === _types.MentionType.User && node.attrs?.modelId) {
        userIds.push(node.attrs.modelId);
      }
      if (node.content) {
        for (const child of node.content) {
          collectUserIds(child);
        }
      }
    }
    collectUserIds(json);

    // Load all users in a single query
    const uniqueUserIds = [...new Set(userIds)];
    const users = uniqueUserIds.length ? await _User.default.findAll({
      where: {
        id: uniqueUserIds
      },
      attributes: ["id", "name"]
    }) : [];

    // Create a map for quick lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.id, user.name);
    });

    // Second pass: transform mentions with loaded user data
    function transformMentions(node) {
      if (node.type === "mention" && node.attrs?.type === _types.MentionType.User && node.attrs?.modelId) {
        const userId = node.attrs.modelId;
        node.attrs = {
          ...node.attrs,
          label: userMap.get(userId) || "Unknown"
        };
      }
      if (node.content) {
        for (const child of node.content) {
          transformMentions(child);
        }
      }
      return node;
    }
    return transformMentions(json);
  }

  /**
   * Removes the first heading from the document if it is an H1.
   *
   * @param doc The Prosemirror document node.
   * @returns A new document with the first H1 removed, or the original if no H1 found.
   */
  static removeFirstHeading(doc) {
    const firstChild = doc.firstChild;
    if (firstChild && firstChild.type.name === "heading" && firstChild.attrs.level === 1) {
      const content = [];
      doc.forEach((node, _offset, index) => {
        if (index > 0) {
          content.push(node);
        }
      });

      // If removing the heading leaves an empty document, return a doc with empty paragraph
      if (content.length === 0) {
        return doc.type.create(null, _editor.schema.nodes.paragraph.create());
      }
      return doc.copy(_prosemirrorModel.Fragment.fromArray(content));
    }
    return doc;
  }

  /**
   * Extracts an emoji from the beginning of the document's first text content.
   * If found, returns the emoji and a new document with the emoji removed.
   *
   * @param doc The Prosemirror document node.
   * @returns An object with the extracted emoji (or undefined) and the modified document.
   */
  static extractEmojiFromStart(doc) {
    // Get the text content from the beginning of the document
    let textContent = "";
    let foundTextNode = null;
    doc.descendants(node => {
      if (foundTextNode) {
        return false;
      }
      if (node.isText && node.text) {
        textContent = node.text;
        foundTextNode = node;
        return false;
      }
      return true;
    });
    if (!textContent) {
      return {
        doc
      };
    }
    const regex = (0, _emojiRegex.default)();
    const match = regex.exec(textContent.slice(0, 10));
    if (!match || match.index !== 0) {
      return {
        doc
      };
    }
    const emoji = match[0];

    // Create a new document with the emoji removed from the text
    const json = doc.toJSON();
    function removeEmojiFromNode(node) {
      if (node.type === "text" && node.text && node.text.startsWith(emoji)) {
        const text = node.text.slice(emoji.length);
        // Removing the emoji can leave an empty text node (e.g. when the text
        // node contained only the emoji). Prosemirror disallows empty text
        // nodes, so drop the node entirely in that case.
        if (!text) {
          return null;
        }
        return {
          ...node,
          text
        };
      }
      if (node.content) {
        let found = false;
        const content = [];
        for (const child of node.content) {
          if (found) {
            content.push(child);
            continue;
          }
          const result = removeEmojiFromNode(child);
          if (result !== child) {
            found = true;
          }
          if (result !== null) {
            content.push(result);
          }
        }
        return {
          ...node,
          content
        };
      }
      return node;
    }
    const modifiedJson = removeEmojiFromNode(json);
    return {
      emoji,
      doc: modifiedJson ? _prosemirrorModel.Node.fromJSON(_editor.schema, modifiedJson) : doc
    };
  }

  /**
   * Patches the global environment with properties from the JSDOM window,
   * necessary for ProseMirror to run in a Node environment.
   *
   * @param domWindow The JSDOM window object.
   * @returns A cleanup function to restore the global environment.
   */
  static patchGlobalEnv(domWindow) {
    const g = global;
    const globalParams = {
      window: g.window,
      document: g.document,
      navigator: g.navigator,
      getSelection: g.getSelection,
      requestAnimationFrame: g.requestAnimationFrame,
      cancelAnimationFrame: g.cancelAnimationFrame,
      HTMLElement: g.HTMLElement,
      Node: g.Node,
      MutationObserver: g.MutationObserver
    };
    const patch = (key, value) => {
      try {
        g[key] = value;
      } catch (_err) {
        // Ignore errors if property is read-only
      }
    };
    patch("window", domWindow);
    patch("document", domWindow.document);
    patch("navigator", domWindow.navigator);
    patch("getSelection", () => null);
    patch("requestAnimationFrame", fn => setTimeout(fn, 0));
    patch("cancelAnimationFrame", id => clearTimeout(id));
    patch("HTMLElement", domWindow.HTMLElement);
    patch("Node", domWindow.Node);
    patch("MutationObserver", domWindow.MutationObserver);
    return () => {
      Object.entries(globalParams).forEach(_ref => {
        let [key, value] = _ref;
        try {
          g[key] = value;
        } catch (_err) {
          // Ignore errors if property is read-only
        }
      });
    };
  }

  /**
   * Replaces remote and base64 encoded images in the given Prosemirror node
   * with attachment urls and uploads the images to the storage provider.
   *
   * @param ctx The API context.
   * @param doc The Prosemirror node to process.
   * @param user The user context.
   * @returns A new Prosemirror node with images replaced.
   */
  static async replaceImagesWithAttachments(ctx, doc, user) {
    const images = ProsemirrorHelper.getImages(doc);
    const videos = ProsemirrorHelper.getVideos(doc);
    const nodes = [...images, ...videos];
    if (!nodes.length) {
      return doc;
    }
    const timeoutPerImage = Math.floor(Math.min(_env.default.REQUEST_TIMEOUT / nodes.length, 10000));
    const urlToAttachment = new Map();
    const chunks = (0, _compat.chunk)(nodes, 10);
    for (const nodeChunk of chunks) {
      await Promise.all(nodeChunk.map(async node => {
        const src = String(node.attrs.src ?? "");

        // Skip invalid URLs
        try {
          new URL(src);
        } catch {
          return;
        }

        // Skip internal URLs
        if ((0, _urls.isInternalUrl)(src)) {
          return;
        }

        // Skip already processed
        if (urlToAttachment.has(src)) {
          return;
        }
        try {
          const attachment = await (0, _attachmentCreator.default)({
            name: String(node.attrs.alt ?? node.type.name),
            url: src,
            preset: _types.AttachmentPreset.DocumentAttachment,
            user,
            fetchOptions: {
              timeout: timeoutPerImage
            },
            ctx
          });
          if (attachment) {
            urlToAttachment.set(src, attachment);
          }
        } catch (err) {
          _Logger.default.warn("Failed to download image for attachment", {
            error: (0, _error.errToString)(err),
            src
          });
        }
      }));
    }

    // Transform the document to replace image/video src attributes
    const transformFragment = fragment => {
      const transformedNodes = [];
      fragment.forEach(node => {
        if (node.type.name === "image" || node.type.name === "video") {
          const src = String(node.attrs.src ?? "");
          const attachment = urlToAttachment.get(src);
          if (attachment) {
            const json = node.toJSON();
            json.attrs = {
              ...json.attrs,
              src: attachment.redirectUrl
            };
            transformedNodes.push(_prosemirrorModel.Node.fromJSON(_editor.schema, json));
          } else {
            transformedNodes.push(node);
          }
        } else if (node.content.size > 0) {
          transformedNodes.push(node.copy(transformFragment(node.content)));
        } else {
          transformedNodes.push(node);
        }
      });
      return _prosemirrorModel.Fragment.fromArray(transformedNodes);
    };
    return doc.copy(transformFragment(doc.content));
  }

  /**
   * Applies a comment mark to a document's Yjs state at the first occurrence
   * of `anchorText` in the document's plain text content.
   *
   * Block boundaries are represented as a single newline; matches that span
   * blocks apply the mark across the union of affected text ranges.
   *
   * `prefix` and `suffix` may be supplied to disambiguate when `anchorText`
   * appears multiple times: the first occurrence whose immediately preceding
   * text equals `prefix` and immediately following text equals `suffix` is
   * used. Empty or omitted prefix/suffix imposes no constraint on that side.
   *
   * @param params.docState The current Yjs document state.
   * @param params.anchorText The plain text substring to anchor the comment to.
   * @param params.commentId The comment identifier.
   * @param params.userId The user identifier.
   * @param params.prefix Optional plain text immediately preceding the match.
   * @param params.suffix Optional plain text immediately following the match.
   * @returns Updated Yjs state, or null if the mark cannot be applied.
   * @throws ValidationError when no match satisfies the prefix/suffix.
   */
  static applyCommentMarkByText(_ref2) {
    let {
      docState,
      anchorText,
      commentId,
      userId,
      prefix,
      suffix
    } = _ref2;
    const yjsDoc = new Y.Doc();
    Y.applyUpdate(yjsDoc, docState);
    const doc = _prosemirrorModel.Node.fromJSON(_editor.schema, (0, _yProsemirror.yDocToProsemirrorJSON)(yjsDoc, "default"));
    const range = ProsemirrorHelper.findTextRange(doc, anchorText, {
      prefix,
      suffix
    });
    if (!range) {
      throw (0, _errors.ValidationError)("anchorText was not found in the document");
    }
    try {
      return ProsemirrorHelper.applyCommentMarkAtRange(yjsDoc, doc, range.from, range.to, commentId, userId);
    } catch (error) {
      _Logger.default.error("Error applying comment mark by text", error);
      return null;
    }
  }
  static applyCommentMarkAtRange(yjsDoc, doc, rangeStart, rangeEnd, commentId, userId) {
    const docSize = doc.content.size;
    if (rangeStart < 0 || rangeEnd > docSize || rangeStart > rangeEnd) {
      _Logger.default.warn("Invalid position range for comment anchor", {
        rangeStart,
        rangeEnd,
        docSize
      });
      return null;
    }
    const initialState = _prosemirrorState.EditorState.create({
      doc,
      schema: _editor.schema
    });
    const markToAdd = _editor.schema.marks.comment.create({
      id: commentId,
      userId,
      draft: false
    });
    const stateTransform = initialState.tr.addMark(rangeStart, rangeEnd, markToAdd);
    const transformedState = initialState.apply(stateTransform);

    // Mutate the existing yjsDoc in place so the resulting state is a
    // continuation of the original document — same client IDs, same operation
    // history — rather than a fresh Y.Doc whose content would merge as
    // duplicates against any client still holding the original state.
    const yFragment = yjsDoc.get("default", Y.XmlFragment);
    if (!yFragment.doc) {
      throw new Error("yFragment.doc not found");
    }
    (0, _yProsemirror.updateYFragment)(yFragment.doc, yFragment, transformedState.doc, {
      mapping: new Map(),
      isOMark: new Map()
    });
    return Buffer.from(Y.encodeStateAsUpdate(yjsDoc));
  }

  /**
   * Locates an occurrence of `needle` in the document's plain text and
   * returns the matching ProseMirror position range, or null if no match.
   * Plain text is built using the editor's `textBetween` so leaf nodes
   * with `spec.leafText` (e.g. mentions) participate in matching.
   *
   * When `prefix` or `suffix` is provided, the first occurrence whose
   * immediately preceding / following plain text matches is selected.
   * Empty or omitted values impose no constraint on that side.
   *
   * Atom nodes (whose plain content comes from `leafText`) cannot be
   * sliced into; matches that fall inside an atom are clamped to the
   * atom's full PM range.
   */
  static findTextRange(doc, needle) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (!needle.length) {
      return null;
    }
    const plain = (0, _textBetween.default)(doc, 0, doc.content.size);

    // Mirror textBetween's traversal so segment.plainStart aligns with the
    // characters in `plain`. If textBetween's algorithm changes, this walk
    // must change with it.

    const segments = [];
    let plainPos = 0;
    let first = true;
    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      let nodeText = "";
      let isLeafText = false;
      if (node.type.spec.leafText) {
        nodeText = node.type.spec.leafText(node);
        isLeafText = true;
      } else if (node.isText) {
        nodeText = node.text ?? "";
      }
      if (node.isBlock && (node.isLeaf && nodeText || node.isTextblock)) {
        if (first) {
          first = false;
        } else {
          plainPos += 1; // block separator '\n'
        }
      }
      if (nodeText) {
        segments.push({
          plainStart: plainPos,
          pmFrom: pos,
          pmTo: pos + node.nodeSize,
          length: nodeText.length,
          isAtom: isLeafText
        });
        plainPos += nodeText.length;
      }
      return !isLeafText;
    });
    const prefix = options.prefix ?? "";
    const suffix = options.suffix ?? "";
    let startIdx = -1;
    let searchFrom = 0;
    while (true) {
      const candidate = plain.indexOf(needle, searchFrom);
      if (candidate === -1) {
        return null;
      }
      const candidateEnd = candidate + needle.length;
      const prefixOk = prefix.length === 0 || candidate >= prefix.length && plain.substring(candidate - prefix.length, candidate) === prefix;
      const suffixOk = suffix.length === 0 || candidateEnd + suffix.length <= plain.length && plain.substring(candidateEnd, candidateEnd + suffix.length) === suffix;
      if (prefixOk && suffixOk) {
        startIdx = candidate;
        break;
      }
      searchFrom = candidate + 1;
    }
    const endIdx = startIdx + needle.length;
    let from = null;
    for (const s of segments) {
      if (s.plainStart <= startIdx && startIdx < s.plainStart + s.length) {
        from = s.isAtom ? s.pmFrom : s.pmFrom + (startIdx - s.plainStart);
        break;
      }
    }
    let to = null;
    for (const s of segments) {
      if (s.plainStart < endIdx && endIdx <= s.plainStart + s.length) {
        to = s.isAtom ? s.pmTo : s.pmFrom + (endIdx - s.plainStart);
      }
    }
    if (from === null || to === null) {
      return null;
    }
    return {
      from,
      to
    };
  }
}, _defineProperty(_ProsemirrorHelper, "mentionEmailMaxChars", 1000), _ProsemirrorHelper)) || _class);