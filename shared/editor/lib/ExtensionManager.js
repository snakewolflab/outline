"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mobxReact = require("mobx-react");
var _prosemirrorKeymap = require("prosemirror-keymap");
var _prosemirrorMarkdown = require("prosemirror-markdown");
var _rules = _interopRequireDefault(require("./markdown/rules"));
var _serializer = require("./markdown/serializer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class ExtensionManager {
  constructor() {
    let extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let editor = arguments.length > 1 ? arguments[1] : undefined;
    _defineProperty(this, "extensions", []);
    _defineProperty(this, "readOnly", void 0);
    this.readOnly = editor?.props.readOnly ?? false;
    extensions.forEach(ext => {
      let extension;
      if (typeof ext === "function") {
        // Check the prototype before instantiation to avoid constructor cost
        // for extensions not needed in read-only mode.
        if (this.readOnly && ext.prototype.type === "extension" && !ext.prototype.allowInReadOnly) {
          return;
        }

        // Cast away abstract: registration treats all classes uniformly and
        // concrete subclasses are required at the public boundary.
        const Ctor = ext;
        extension = new Ctor(editor?.props);
      } else {
        // For already-instantiated extensions, check the instance.
        if (this.readOnly && ext.type === "extension" && !ext.allowInReadOnly) {
          return;
        }
        extension = ext;
      }
      if (editor) {
        extension.bindEditor(editor);
      }
      this.extensions.push(extension);
    });
  }
  get widgets() {
    return Object.fromEntries(this.extensions.filter(extension => extension.widget({
      rtl: false,
      readOnly: false
    })).map(node => [node.name, (0, _mobxReact.observer)(props => node.widget(props))]));
  }
  get nodes() {
    const nodes = Object.fromEntries(this.extensions.filter(extension => extension.type === "node").map(node => [node.name, node.schema]));
    for (const i in nodes) {
      const {
        marks
      } = nodes[i];
      if (marks) {
        // We must filter marks from the marks list that are not defined
        // in the schema for the current editor.
        nodes[i].marks = marks.split(" ").filter(m => Object.keys(this.marks).includes(m)).join(" ");
      }
    }
    return nodes;
  }
  get marks() {
    const marks = Object.fromEntries(this.extensions.filter(extension => extension.type === "mark").map(mark => [mark.name, mark.schema]));
    for (const i in marks) {
      const {
        excludes
      } = marks[i];
      if (excludes) {
        // We must filter marks from the excludes list that are not defined
        // in the schema for the current editor.
        marks[i].excludes = excludes.split(" ").filter(m => Object.keys(marks).includes(m)).join(" ");
      }
    }
    return marks;
  }
  serializer() {
    const nodes = Object.fromEntries(this.extensions.filter(extension => extension.type === "node").map(extension => [extension.name, function () {
      return extension.toMarkdown(...arguments);
    }]));
    const marks = Object.fromEntries(this.extensions.filter(extension => extension.type === "mark").map(extension => [extension.name, function () {
      return extension.toMarkdown(...arguments);
    }]));
    return new _serializer.MarkdownSerializer(nodes, marks);
  }
  parser(_ref) {
    let {
      schema,
      rules,
      plugins
    } = _ref;
    const tokens = Object.fromEntries(this.extensions.filter(extension => extension.type === "mark" || extension.type === "node").flatMap(extension => {
      const parseSpec = extension.parseMarkdown();
      if (!parseSpec) {
        return [];
      }
      return [[extension.markdownToken || extension.name, parseSpec]];
    }));
    return new _prosemirrorMarkdown.MarkdownParser(schema, (0, _rules.default)({
      rules,
      schema,
      plugins
    }), tokens);
  }
  get plugins() {
    return this.extensions.filter(extension => "plugins" in extension).reduce((allPlugins, _ref2) => {
      let {
        plugins
      } = _ref2;
      return [...allPlugins, ...plugins];
    }, []);
  }
  get rulePlugins() {
    return this.extensions.filter(extension => "rulePlugins" in extension).reduce((allRulePlugins, _ref3) => {
      let {
        rulePlugins
      } = _ref3;
      return [...allRulePlugins, ...rulePlugins];
    }, []);
  }
  keymaps(_ref4) {
    let {
      schema
    } = _ref4;
    const keymaps = this.extensions.filter(extension => extension.keys).map(extension => {
      if (extension.type === "node") {
        const node = extension;
        return node.keys({
          type: schema.nodes[node.name],
          schema
        });
      }
      if (extension.type === "mark") {
        const mark = extension;
        return mark.keys({
          type: schema.marks[mark.name],
          schema
        });
      }
      return extension.keys({
        schema
      });
    });
    return keymaps.map(_prosemirrorKeymap.keymap);
  }
  inputRules(_ref5) {
    let {
      schema
    } = _ref5;
    const extensionInputRules = this.extensions.filter(extension => extension.type === "extension").filter(extension => extension.inputRules).map(extension => extension.inputRules({
      schema
    }));
    const nodeMarkInputRules = this.extensions.filter(extension => extension.type === "node" || extension.type === "mark").filter(extension => extension.inputRules).map(extension => {
      if (extension.type === "node") {
        const node = extension;
        return node.inputRules({
          type: schema.nodes[node.name],
          schema
        });
      }
      const mark = extension;
      return mark.inputRules({
        type: schema.marks[mark.name],
        schema
      });
    });
    return [...extensionInputRules, ...nodeMarkInputRules].reduce((allInputRules, inputRules) => [...allInputRules, ...inputRules], []);
  }

  /**
   * Collects selection toolbar menu descriptors from all extensions and returns
   * them sorted by priority (highest first). The toolbar evaluates these in
   * order and displays the first match.
   */
  get selectionToolbarMenus() {
    return this.extensions.flatMap(extension => extension.selectionToolbarMenus()).sort((a, b) => b.priority - a.priority);
  }
  commands(_ref6) {
    let {
      schema,
      view
    } = _ref6;
    return this.extensions.filter(extension => extension.commands).reduce((allCommands, extension) => {
      const {
        name
      } = extension;
      const commands = {};
      let value;
      if (extension.type === "node") {
        const node = extension;
        value = node.commands({
          schema,
          type: schema.nodes[node.name]
        });
      } else if (extension.type === "mark") {
        const mark = extension;
        value = mark.commands({
          schema,
          type: schema.marks[mark.name]
        });
      } else {
        value = extension.commands({
          schema
        });
      }
      const apply = (callback, attrs) => {
        if (!view.editable && !extension.allowInReadOnly) {
          return;
        }
        if (extension.focusAfterExecution) {
          // Focusing a blurred editor (e.g. when the command is run from a
          // menu that holds focus) can collapse a non-text selection such as
          // a table cell selection. Restore it so selection-based commands
          // operate on the intended selection.
          const {
            selection
          } = view.state;
          view.focus();
          if (!view.state.selection.eq(selection)) {
            view.dispatch(view.state.tr.setSelection(selection).setMeta("addToHistory", false));
          }
        }
        return callback(attrs)?.(view.state, view.dispatch, view);
      };
      const handle = (_name, _value) => {
        const values = Array.isArray(_value) ? _value : [_value];

        // @ts-expect-error FIXME
        commands[_name] = attrs => values.forEach(callback => apply(callback, attrs));
      };
      if (typeof value === "object") {
        Object.entries(value).forEach(_ref7 => {
          let [commandName, commandValue] = _ref7;
          handle(commandName, commandValue);
        });
      } else if (value) {
        handle(name, value);
      }
      return {
        ...allCommands,
        ...commands
      };
    }, {});
  }
}
exports.default = ExtensionManager;