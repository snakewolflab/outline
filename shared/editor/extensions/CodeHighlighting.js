"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeHighlighting = CodeHighlighting;
var _compat = require("es-toolkit/compat");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _code = require("../lib/code");
var _multiplayer = require("../lib/multiplayer");
var _findChildren = require("../queries/findChildren");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const cache = {};
const languagesToImport = new Set();
const languagePromises = {};
let refractor;

/** Lazily load refractor core. */
async function getRefractor() {
  refractor ??= (await Promise.resolve().then(() => _interopRequireWildcard(require("refractor/core")))).default;
  return refractor;
}
async function loadLanguage(language) {
  const r = await getRefractor();
  if (!language || r.registered(language)) {
    return;
  }
  if (languagePromises[language]) {
    return languagePromises[language];
  }
  const loader = (0, _code.getLoaderForLanguage)(language);
  if (!loader) {
    return;
  }
  languagePromises[language] = loader().then(syntax => {
    r.register(syntax);
    return language;
  }).catch(err => {
    // It will retry loading the language on the next render
    // oxlint-disable-next-line no-console
    console.error(`Failed to load language ${language} for code highlighting`, err);
    delete languagePromises[language]; // Remove failed promise from cache
    return undefined;
  });
  return languagePromises[language];
}
function getDecorations(_ref) {
  let {
    doc,
    name,
    lineNumbers
  } = _ref;
  const decorations = [];
  const blocks = (0, _findChildren.findBlockNodes)(doc, true).filter(item => item.node.type.name === name);
  function parseNodes(nodes) {
    let classNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return (0, _compat.flattenDeep)(nodes.map(node => {
      if (node.type === "element") {
        const classes = [...classNames, ...(node.properties.className || [])];
        return parseNodes(node.children, classes);
      }
      return {
        text: node.value,
        classes: classNames
      };
    }));
  }
  blocks.forEach(block => {
    let startPos = block.pos + 1;
    const language = block.node.attrs.language;
    const lang = (0, _code.getRefractorLangForLanguage)(language);
    const lineDecorations = [];
    if (!cache[block.pos] || !cache[block.pos].node.eq(block.node)) {
      if (lineNumbers && !block.node.attrs.wrap) {
        const lineCount = (block.node.textContent.match(/\n/g) || []).length + 1;
        const gutterWidth = String(lineCount).length;
        const lineCountText = new Array(lineCount).fill(0).map((_, i) => (0, _compat.padStart)(`${i + 1}`, gutterWidth, " ")).join("\n");
        lineDecorations.push(_prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {
          "data-line-numbers": `${lineCountText}`,
          style: `--line-number-gutter-width: ${gutterWidth};`
        }, {
          key: `line-${lineCount}-gutter`
        }));
      }
      cache[block.pos] = {
        node: block.node,
        decorations: lineDecorations
      };
      if (!lang) {
        // do nothing
      } else if (refractor?.registered(lang)) {
        languagesToImport.delete(language);
        const nodes = refractor.highlight(block.node.textContent, lang);
        const newDecorations = parseNodes(nodes).map(node => {
          const from = startPos;
          const to = from + node.text.length;
          startPos = to;
          return {
            ...node,
            from,
            to
          };
        }).filter(node => node.classes && node.classes.length).map(node => _prosemirrorView.Decoration.inline(node.from, node.to, {
          class: node.classes.join(" ")
        })).concat(lineDecorations);
        cache[block.pos] = {
          node: block.node,
          decorations: newDecorations
        };
      } else {
        languagesToImport.add(language);
      }
    }
    cache[block.pos]?.decorations.forEach(decoration => {
      decorations.push(decoration);
    });
  });
  Object.keys(cache).filter(pos => !blocks.find(block => block.pos === Number(pos))).forEach(pos => {
    delete cache[Number(pos)];
  });
  return _prosemirrorView.DecorationSet.create(doc, decorations);
}
function CodeHighlighting(_ref2) {
  let {
    name,
    lineNumbers
  } = _ref2;
  let highlighted = false;
  return new _prosemirrorState.Plugin({
    key: new _prosemirrorState.PluginKey("codeHighlighting"),
    state: {
      init: (_, _ref3) => {
        let {
          doc
        } = _ref3;
        return _prosemirrorView.DecorationSet.create(doc, []);
      },
      apply: (transaction, decorationSet, oldState, state) => {
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged = transaction.docChanged && [nodeName, previousNodeName].includes(name);

        // @ts-expect-error accessing private field.
        const isPaste = transaction.meta?.paste;
        const langLoaded = transaction.getMeta("codeHighlighting")?.langLoaded;
        if (!highlighted || codeBlockChanged || isPaste || langLoaded || (0, _multiplayer.isRemoteTransaction)(transaction)) {
          // Invalidate cached entries for blocks whose language just loaded
          // so getDecorations rebuilds them with syntax highlighting applied.
          if (Array.isArray(langLoaded)) {
            for (const key of Object.keys(cache)) {
              const pos = Number(key);
              if (langLoaded.includes(cache[pos]?.node.attrs.language)) {
                delete cache[pos];
              }
            }
          }
          highlighted = true;
          return getDecorations({
            doc: transaction.doc,
            name,
            lineNumbers
          });
        }
        return decorationSet.map(transaction.mapping, transaction.doc);
      }
    },
    view: view => {
      if (!highlighted) {
        void getRefractor().then(() => {
          if (!view.isDestroyed) {
            view.dispatch(view.state.tr.setMeta("codeHighlighting", {
              langLoaded: true
            }));
          }
        });
      }
      return {
        update: () => {
          if (!languagesToImport.size) {
            return;
          }
          void Promise.all([...languagesToImport].map(loadLanguage)).then(results => {
            const loaded = results.filter(lang => !!lang);
            if (loaded.length && !view.isDestroyed) {
              view.dispatch(view.state.tr.setMeta("codeHighlighting", {
                langLoaded: loaded
              }));
            }
          });
        }
      };
    },
    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}