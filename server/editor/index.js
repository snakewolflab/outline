"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializer = exports.schema = exports.plugins = exports.parser = exports.extensionManager = exports.commentSchema = exports.commentParser = exports.commentExtensionManager = exports.basicSchema = exports.basicParser = exports.basicExtensionManager = void 0;
var _data = _interopRequireDefault(require("@emoji-mart/data"));
var _prosemirrorModel = require("prosemirror-model");
var _ExtensionManager = _interopRequireDefault(require("../../shared/editor/lib/ExtensionManager"));
var _emoji = require("../../shared/editor/lib/emoji");
var _nodes = require("../../shared/editor/nodes");
var _CodeBlock = _interopRequireDefault(require("../../shared/editor/nodes/CodeBlock"));
var _CodeFence = _interopRequireDefault(require("../../shared/editor/nodes/CodeFence"));
var _Mention = _interopRequireDefault(require("../../shared/editor/nodes/Mention"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _emoji.populateEmojiData)(_data.default);

// Server-side parsing/serializing only requires schema and a few static props,
// but the Extension API expects a full Editor. This stub satisfies bindEditor
// without instantiating the React component.
const stubEditor = s => ({
  schema: s,
  props: {
    theme: {
      isDark: false
    }
  }
});
const extensions = (0, _nodes.withComments)(_nodes.richExtensions);
const extensionManager = exports.extensionManager = new _ExtensionManager.default(extensions);
const schema = exports.schema = new _prosemirrorModel.Schema({
  nodes: extensionManager.nodes,
  marks: extensionManager.marks
});
for (const extension of extensionManager.extensions) {
  extension.bindEditor(stubEditor(schema));
}
const parser = exports.parser = extensionManager.parser({
  schema,
  plugins: extensionManager.rulePlugins
});
const serializer = exports.serializer = extensionManager.serializer();
const plugins = exports.plugins = extensionManager.plugins;
const basicExtensionManager = exports.basicExtensionManager = new _ExtensionManager.default(_nodes.basicExtensions);
const basicSchema = exports.basicSchema = new _prosemirrorModel.Schema({
  nodes: basicExtensionManager.nodes,
  marks: basicExtensionManager.marks
});
for (const extension of basicExtensionManager.extensions) {
  extension.bindEditor(stubEditor(basicSchema));
}
const basicParser = exports.basicParser = basicExtensionManager.parser({
  schema: basicSchema,
  plugins: basicExtensionManager.rulePlugins
});
const commentExtensions = [..._nodes.basicExtensions, _CodeBlock.default, _CodeFence.default, _Mention.default];
const commentExtensionManager = exports.commentExtensionManager = new _ExtensionManager.default(commentExtensions);
const commentSchema = exports.commentSchema = new _prosemirrorModel.Schema({
  nodes: commentExtensionManager.nodes,
  marks: commentExtensionManager.marks
});
for (const extension of commentExtensionManager.extensions) {
  extension.bindEditor(stubEditor(commentSchema));
}
const commentParser = exports.commentParser = commentExtensionManager.parser({
  schema: commentSchema,
  plugins: commentExtensionManager.rulePlugins
});