"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blockquote = blockquote;
exports.bulletList = bulletList;
exports.codeBlock = codeBlock;
exports.createEditorState = createEditorState;
exports.createEditorStateWithSelection = createEditorStateWithSelection;
exports.doc = doc;
exports.extensionManager = void 0;
exports.findNodes = findNodes;
exports.heading = heading;
exports.hr = hr;
exports.orderedList = orderedList;
exports.p = p;
exports.schema = void 0;
exports.table = table;
exports.td = td;
exports.th = th;
exports.tr = tr;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _ExtensionManager = _interopRequireDefault(require("../editor/lib/ExtensionManager"));
var _nodes = require("../editor/nodes");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Extension manager using the full rich extensions from the editor.
 */
const extensionManager = exports.extensionManager = new _ExtensionManager.default(_nodes.richExtensions);

/**
 * Schema using the actual rich extensions from the editor.
 * This should be used for testing to ensure we're testing against real node definitions.
 */
const schema = exports.schema = new _prosemirrorModel.Schema({
  nodes: extensionManager.nodes,
  marks: extensionManager.marks
});

/**
 * Creates an editor state with the given document and plugins.
 *
 * @param doc - the document node.
 * @param plugins - optional array of plugins to include.
 * @returns editor state.
 */
function createEditorState(doc) {
  let plugins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return _prosemirrorState.EditorState.create({
    doc,
    schema,
    plugins
  });
}

/**
 * Creates an editor state with the selection set inside a specific position.
 * Useful for tests that require the selection to be inside a table or other node.
 *
 * @param doc - the document node.
 * @param pos - position to set selection near.
 * @param plugins - optional array of plugins to include.
 * @returns editor state with selection at the specified position.
 */
function createEditorStateWithSelection(doc, pos) {
  let plugins = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  const state = createEditorState(doc, plugins);
  const $pos = state.doc.resolve(pos);
  const selection = _prosemirrorState.TextSelection.near($pos);
  return state.apply(state.tr.setSelection(selection));
}

/**
 * Creates a paragraph node with optional text content.
 *
 * @param text - the text content (empty string for empty paragraph).
 * @returns paragraph node.
 */
function p(text) {
  return schema.nodes.paragraph.create(null, text ? schema.text(text) : undefined);
}

/**
 * Creates a table cell (td) node.
 *
 * @param content - the cell content text.
 * @param attrs - optional cell attributes (colspan, rowspan, colwidth, alignment).
 * @returns td node.
 */
function td(content, attrs) {
  return schema.nodes.td.create(attrs ?? null, p(content));
}

/**
 * Creates a table header cell (th) node.
 *
 * @param content - the cell content text.
 * @param attrs - optional cell attributes (colspan, rowspan, colwidth, alignment).
 * @returns th node.
 */
function th(content, attrs) {
  return schema.nodes.th.create(attrs ?? null, p(content));
}

/**
 * Creates a table row (tr) node.
 *
 * @param cells - array of cell nodes (td or th).
 * @returns tr node.
 */
function tr(cells) {
  return schema.nodes.tr.create(null, cells);
}

/**
 * Creates a table node.
 *
 * @param rows - array of row nodes.
 * @param attrs - optional table attributes.
 * @returns table node.
 */
function table(rows, attrs) {
  return schema.nodes.table.create(attrs ?? null, rows);
}

/**
 * Creates a heading node.
 *
 * @param text - the heading text.
 * @param level - the heading level (1-6).
 * @returns heading node.
 */
function heading(text) {
  let level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return schema.nodes.heading.create({
    level
  }, text ? schema.text(text) : undefined);
}

/**
 * Creates a blockquote node.
 *
 * @param content - array of block nodes or a single paragraph text.
 * @returns blockquote node.
 */
function blockquote(content) {
  const children = typeof content === "string" ? [p(content)] : content;
  return schema.nodes.blockquote.create(null, children);
}

/**
 * Creates a bullet list node.
 *
 * @param items - array of text strings for list items.
 * @returns bullet_list node.
 */
function bulletList(items) {
  return schema.nodes.bullet_list.create(null, items.map(text => schema.nodes.list_item.create(null, p(text))));
}

/**
 * Creates an ordered list node.
 *
 * @param items - array of text strings for list items.
 * @returns ordered_list node.
 */
function orderedList(items) {
  return schema.nodes.ordered_list.create(null, items.map(text => schema.nodes.list_item.create(null, p(text))));
}

/**
 * Creates a code block node.
 *
 * @param code - the code content.
 * @param language - optional language for syntax highlighting.
 * @returns code_block node.
 */
function codeBlock(code, language) {
  return schema.nodes.code_block.create(language ? {
    language
  } : null, code ? schema.text(code) : undefined);
}

/**
 * Creates a horizontal rule node.
 *
 * @returns hr node.
 */
function hr() {
  return schema.nodes.hr.create();
}

/**
 * Creates a document node with the given content.
 *
 * @param content - block node(s) to include in the document.
 * @returns doc node.
 */
function doc(content) {
  return schema.nodes.doc.create(null, content);
}

/**
 * A plain-object representation of a ProseMirror node, as returned by
 * `Node.toJSON()`.
 */

/**
 * Recursively collects all nodes of the given type from a `Node.toJSON()`
 * tree, including the root node itself.
 *
 * @param node - the JSON node to search, may be undefined for convenience.
 * @param type - the node type name to match.
 * @returns array of matching nodes in document order.
 */
function findNodes(node, type) {
  if (!node) {
    return [];
  }
  return [...(node.type === type ? [node] : []), ...(node.content ?? []).flatMap(child => findNodes(child, type))];
}