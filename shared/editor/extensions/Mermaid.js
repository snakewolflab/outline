"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Mermaid;
exports.pluginKey = void 0;
var _compat = require("es-toolkit/compat");
var _i18next = require("i18next");
var _uuid = require("uuid");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _sonner = require("sonner");
var _error = require("../../utils/error");
var _isCode = require("../lib/isCode");
var _multiplayer = require("../lib/multiplayer");
var _findChildren = require("../queries/findChildren");
var _findParentNode = require("../queries/findParentNode");
var _Lightbox = require("../lib/Lightbox");
var _string = require("../../utils/string");
var _urls = require("../../utils/urls");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const pluginKey = exports.pluginKey = new _prosemirrorState.PluginKey("mermaid");
// The `v2` namespace discards entries cached before the #11782 fix, so
// previously mis-sized diagrams are re-rendered instead of served from cache.
const STORAGE_PREFIX = "mermaid:v2:";
const MAX_STORAGE_ENTRIES = 20;
class Cache {
  /** Get a cached SVG by diagram text and theme. */
  static get(key) {
    try {
      const hash = (0, _string.hashString)(key);
      const value = sessionStorage.getItem(STORAGE_PREFIX + hash);
      if (value) {
        this.touchLru(hash);
        return value;
      }
    } catch {
      // sessionStorage unavailable
    }
    return undefined;
  }

  /** Cache a rendered SVG in sessionStorage. */
  static set(key, value) {
    try {
      const hash = (0, _string.hashString)(key);
      this.touchLru(hash);
      this.pruneStorage();
      sessionStorage.setItem(STORAGE_PREFIX + hash, value);
    } catch {
      // sessionStorage full or unavailable
    }
  }

  /** Move or append a hash to the end (most recent) of the LRU list. */
  static touchLru(hash) {
    const lru = this.getLru();
    const idx = lru.indexOf(hash);
    if (idx !== -1) {
      lru.splice(idx, 1);
    }
    lru.push(hash);
    sessionStorage.setItem(STORAGE_PREFIX + "lru", JSON.stringify(lru));
  }

  /** Evict least-recently-used entries when over the limit. */
  static pruneStorage() {
    const lru = this.getLru();
    while (lru.length > MAX_STORAGE_ENTRIES) {
      const evict = lru.shift();
      sessionStorage.removeItem(STORAGE_PREFIX + evict);
    }
    sessionStorage.setItem(STORAGE_PREFIX + "lru", JSON.stringify(lru));
  }

  /** Read the LRU order list from sessionStorage. */
  static getLru() {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + "lru");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // corrupted or unavailable
    }
    return [];
  }
}
let mermaid;

/** Minimal Iconify JSON icon set format required by Mermaid's `registerIconPacks` API. */

/**
 * Converts a FontAwesome icon pack to the Iconify JSON format expected by Mermaid's
 * `registerIconPacks` API.
 *
 * @param pack the FontAwesome icon pack to convert.
 * @param prefix the Iconify prefix to use (e.g. "fa-solid" or "fa-brands").
 * @returns an Iconify-compatible JSON icon set.
 */
function fontAwesomeToIconify(pack, prefix) {
  const icons = {};
  for (const iconDef of Object.values(pack)) {
    // icon array layout: [width, height, ligatures, unicode, svgPathData]
    if (!iconDef.iconName || !iconDef.icon) {
      continue;
    }
    const [width, height,,, paths] = iconDef.icon;
    const body = Array.isArray(paths) ? paths.map(p => `<path d="${p}"/>`).join("") : `<path d="${paths}"/>`;
    icons[iconDef.iconName] = {
      body,
      width,
      height
    };
  }
  return {
    prefix,
    icons
  };
}
class MermaidRenderer {
  constructor(editor) {
    _defineProperty(this, "diagramId", void 0);
    _defineProperty(this, "element", void 0);
    _defineProperty(this, "elementId", void 0);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "render", async (block, isDark) => {
      const element = this.element;
      const text = block.node.textContent;
      const cacheKey = `${isDark ? "dark" : "light"}-${text}`;
      const cache = Cache.get(cacheKey);
      if (cache) {
        element.classList.remove("parse-error", "empty");
        element.innerHTML = cache;
        return;
      }

      // Create a temporary element for rendering. We use visibility:hidden instead of
      // offscreen positioning so the browser computes correct bounding boxes for SVG
      // elements — offscreen elements can produce incorrect getBBox() results, leading
      // to wrong viewBox dimensions (see mermaid-js/mermaid#6146).
      const renderElement = document.createElement("div");
      const tempId = "offscreen-mermaid-" + Math.random().toString(36).substr(2, 9);
      renderElement.id = tempId;
      renderElement.style.position = "fixed";
      renderElement.style.visibility = "hidden";
      renderElement.style.top = "0";
      renderElement.style.left = "0";
      const width = this.editor.view?.dom.clientWidth ?? window.innerWidth;
      renderElement.style.width = `${width}px`;
      renderElement.style.zIndex = "-1";
      document.body.appendChild(renderElement);
      try {
        if (!mermaid) {
          mermaid = (await Promise.resolve().then(() => _interopRequireWildcard(require("mermaid")))).default;
          mermaid.registerLayoutLoaders([{
            name: "elk",
            loader: async () => {
              const {
                default: elkLayouts
              } = await Promise.resolve().then(() => _interopRequireWildcard(require("@mermaid-js/layout-elk")));
              const elkDef = elkLayouts.find(d => d.name === "elk");
              if (!elkDef) {
                throw new Error("ELK layout not found");
              }
              return elkDef.loader();
            }
          }]);
          mermaid.registerIconPacks([{
            name: "fa-solid",
            loader: async () => {
              const {
                fas
              } = await Promise.resolve().then(() => _interopRequireWildcard(require("@fortawesome/free-solid-svg-icons")));
              return fontAwesomeToIconify(fas, "fa-solid");
            }
          }, {
            name: "fa-brands",
            loader: async () => {
              const {
                fab
              } = await Promise.resolve().then(() => _interopRequireWildcard(require("@fortawesome/free-brands-svg-icons")));
              return fontAwesomeToIconify(fab, "fa-brands");
            }
          }]);
        }
        mermaid.initialize({
          startOnLoad: true,
          suppressErrorRendering: true,
          // TODO: Make dynamic based on the width of the editor or remove in
          // the future if Mermaid is able to handle this automatically.
          gantt: {
            useWidth: 700
          },
          pie: {
            useWidth: 700
          },
          fontFamily: getComputedStyle(this.element).fontFamily || "inherit",
          theme: isDark ? "dark" : "default",
          darkMode: isDark
        });
        const {
          svg,
          bindFunctions
        } = await mermaid.render(tempId, text);
        element.classList.remove("parse-error", "empty");
        element.innerHTML = svg;

        // Allow the user to interact with the diagram
        bindFunctions?.(element);

        // Mermaid sizes the SVG from a getBBox() taken in the hidden render
        // element, which is unreliable on high-DPI/RDP displays and leaves
        // diagrams too large or too small (#11782). Re-frame from the now-visible
        // SVG, where getBBox() reflects the real content.
        const rendered = element.querySelector("svg");
        if (rendered instanceof SVGSVGElement) {
          const box = rendered.getBBox();
          if (box.width > 0 && box.height > 0) {
            const padding = 8;
            const frameWidth = box.width + padding * 2;
            rendered.setAttribute("viewBox", `${box.x - padding} ${box.y - padding} ${frameWidth} ${box.height + padding * 2}`);
            rendered.style.width = "100%";
            rendered.style.maxWidth = `${frameWidth}px`;
          }
        }

        // Cache the corrected SVG so we won't need to calculate it again this session
        if (text) {
          Cache.set(cacheKey, element.innerHTML);
        }
      } catch (error) {
        const isEmpty = block.node.textContent.trim().length === 0;
        if (isEmpty) {
          element.innerText = "Empty diagram";
          element.classList.add("empty");
        } else {
          element.innerText = (0, _error.errToString)(error);
          element.classList.add("parse-error");
        }
      } finally {
        renderElement.remove();
      }
    });
    this.diagramId = (0, _uuid.v4)();
    this.elementId = `mermaid-diagram-wrapper-${this.diagramId}`;
    this.element = document.getElementById(this.elementId) || document.createElement("div");
    this.element.id = this.elementId;
    this.element.classList.add("mermaid-diagram-wrapper");
    this.editor = editor;
  }
}
function overlap(start1, end1, start2, end2) {
  return Math.max(0, Math.min(end1, end2) - Math.max(start1, start2));
}
/*
  This code find the decoration that overlap the most with a given node.
  This will ensure we can find the best decoration that match the last change set
  See: https://github.com/outline/outline/pull/5852/files#r1334929120
*/
function findBestOverlapDecoration(decorations, block) {
  if (decorations.length === 0) {
    return undefined;
  }
  return (0, _compat.last)((0, _compat.sortBy)(decorations, decoration => overlap(decoration.from, decoration.to, block.pos, block.pos + block.node.nodeSize)));
}
function getNewState(_ref) {
  let {
    doc,
    pluginState,
    editor,
    autoEditEmpty = false
  } = _ref;
  const decorations = [];
  let newEditingId;

  // Find all blocks that represent Mermaid diagrams (supports both "mermaid" and "mermaidjs"),
  // descending into containers so diagrams inside toggle blocks are also discovered.
  const blocks = (0, _findChildren.findBlockNodes)(doc, true).filter(item => (0, _isCode.isMermaid)(item.node));
  blocks.forEach(block => {
    const existingDecorations = pluginState.decorationSet.find(block.pos, block.pos + block.node.nodeSize, spec => !!spec.diagramId);
    const bestDecoration = findBestOverlapDecoration(existingDecorations, block);
    const isNewBlock = !bestDecoration;
    const renderer = bestDecoration?.spec?.renderer ?? new MermaidRenderer(editor);

    // Auto-enter edit mode for newly created empty mermaid diagrams
    if (autoEditEmpty && isNewBlock && block.node.textContent.trim().length === 0) {
      newEditingId = renderer.diagramId;
    }
    const diagramDecoration = _prosemirrorView.Decoration.widget(block.pos + block.node.nodeSize, () => {
      void renderer.render(block, pluginState.isDark);
      return renderer.element;
    }, {
      diagramId: renderer.diagramId,
      renderer,
      side: -10
    });
    const diagramIdDecoration = _prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {}, {
      diagramId: renderer.diagramId,
      renderer
    });
    decorations.push(diagramDecoration);
    decorations.push(diagramIdDecoration);
  });
  return {
    ...pluginState,
    ...(newEditingId !== undefined ? {
      editingId: newEditingId
    } : {}),
    decorationSet: _prosemirrorView.DecorationSet.create(doc, decorations)
  };
}
function Mermaid(_ref2) {
  let {
    isDark,
    editor
  } = _ref2;
  const {
    onClickLink
  } = editor.props;
  return new _prosemirrorState.Plugin({
    key: pluginKey,
    state: {
      init: (_, _ref3) => {
        let {
          doc
        } = _ref3;
        const pluginState = {
          decorationSet: _prosemirrorView.DecorationSet.create(doc, []),
          isDark
        };
        return getNewState({
          doc,
          pluginState,
          editor
        });
      },
      apply: (transaction, pluginState, oldState, state) => {
        const themeMeta = transaction.getMeta("theme");
        const mermaidMeta = transaction.getMeta(pluginKey);
        const themeToggled = themeMeta?.isDark !== undefined;
        const nextPluginState = {
          ...pluginState,
          isDark: themeToggled ? themeMeta.isDark : pluginState.isDark,
          editingId: mermaidMeta && "editingId" in mermaidMeta ? mermaidMeta.editingId : pluginState.editingId,
          decorationSet: (0, _multiplayer.mapDecorations)(pluginState.decorationSet, transaction)
        };
        if (transaction.selectionSet && nextPluginState.editingId && !mermaidMeta) {
          const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
          let isEditing = codeBlock && (0, _isCode.isMermaid)(codeBlock.node);
          if (isEditing && codeBlock && !transaction.docChanged) {
            const decorations = nextPluginState.decorationSet.find(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize);
            const nodeDecoration = decorations.find(d => d.spec.diagramId && d.from === codeBlock.pos);
            if (nodeDecoration?.spec.diagramId !== nextPluginState.editingId) {
              isEditing = false;
            }
          }
          if (!isEditing) {
            nextPluginState.editingId = undefined;
          }
        }
        const node = state.selection.$head.parent;
        const previousNode = oldState.selection.$head.parent;
        const codeBlockChanged = transaction.docChanged && ((0, _isCode.isMermaid)(node) || (0, _isCode.isMermaid)(previousNode));

        // @ts-expect-error accessing private field.
        const isPaste = transaction.meta?.paste;
        if (isPaste || mermaidMeta || themeToggled || codeBlockChanged || (0, _multiplayer.isRemoteTransaction)(transaction)) {
          return getNewState({
            doc: transaction.doc,
            pluginState: nextPluginState,
            editor,
            autoEditEmpty: codeBlockChanged && transaction.docChanged && !isPaste && !(0, _multiplayer.isRemoteTransaction)(transaction)
          });
        }
        return nextPluginState;
      }
    },
    appendTransaction(_transactions, _oldState, newState) {
      const {
        selection
      } = newState;
      if (selection instanceof _prosemirrorState.NodeSelection) {
        return null;
      }
      const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(selection);
      if (!codeBlock || !(0, _isCode.isMermaid)(codeBlock.node)) {
        return null;
      }
      const mermaidState = pluginKey.getState(newState);
      const decorations = mermaidState?.decorationSet.find(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize);
      const nodeDecoration = decorations?.find(d => d.spec.diagramId && d.from === codeBlock.pos);
      if (nodeDecoration?.spec.diagramId && mermaidState?.editingId === nodeDecoration.spec.diagramId) {
        return null;
      }
      return newState.tr.setSelection(_prosemirrorState.NodeSelection.create(newState.doc, codeBlock.pos));
    },
    view: view => {
      view.dispatch(view.state.tr.setMeta(pluginKey, {
        loaded: true
      }));
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorationSet;
      },
      handleKeyDown(view, event) {
        if (event.key === "Enter" && event.metaKey && !editor.props.readOnly) {
          const {
            selection
          } = view.state;
          const isNodeSel = selection instanceof _prosemirrorState.NodeSelection;
          const isMermaidNode = isNodeSel && (0, _isCode.isMermaid)(selection.node);
          if (isNodeSel && isMermaidNode) {
            editor.commands.edit_mermaid();
            return true;
          }
        }
        if (event.key === "Escape") {
          const mermaidState = pluginKey.getState(view.state);
          const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(view.state.selection);
          if (mermaidState?.editingId) {
            if (codeBlock && (0, _isCode.isMermaid)(codeBlock.node)) {
              editor.commands.edit_mermaid();
              return true;
            }
          }
        }
        return false;
      },
      handleDOMEvents: {
        click(_view, event) {
          const target = event.target;
          const anchor = target?.closest("a");
          if (anchor instanceof SVGAElement) {
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
          return true;
        },
        mousedown(view, event) {
          const target = event.target;
          const diagram = target?.closest(".mermaid-diagram-wrapper");
          if (!diagram) {
            return false;
          }
          const codeBlock = diagram.previousElementSibling;
          if (!codeBlock) {
            return false;
          }
          const pos = view.posAtDOM(codeBlock, 0);
          const $pos = view.state.doc.resolve(pos);
          const nodePos = $pos.before();
          const node = view.state.doc.nodeAt(nodePos);
          const isSelected = view.state.selection instanceof _prosemirrorState.NodeSelection && view.state.selection.from === nodePos;
          event.preventDefault();
          if (isSelected || editor.props.readOnly) {
            // Already selected or read-only, open lightbox
            if (node && node.textContent.trim().length > 0) {
              editor.updateActiveLightboxImage(_Lightbox.LightboxImageFactory.createLightboxImage(view, nodePos));
            }
          } else {
            // First click, select the node
            view.dispatch(view.state.tr.setSelection(_prosemirrorState.NodeSelection.create(view.state.doc, nodePos)).scrollIntoView());
          }
          return true;
        },
        mouseup(view, event) {
          const target = event.target;
          const diagram = target?.closest(".mermaid-diagram-wrapper");
          if (!diagram) {
            return false;
          }
          const anchor = target?.closest("a");
          if (anchor instanceof SVGAElement) {
            const href = anchor.getAttribute("xlink:href");
            try {
              if (onClickLink && href) {
                event.stopPropagation();
                event.preventDefault();
                onClickLink((0, _urls.sanitizeUrl)(href) ?? "");
              }
            } catch (_err) {
              _sonner.toast.error((0, _i18next.t)("Sorry, that type of link is not supported"));
            }
          }
          return false;
        }
      }
    }
  });
}