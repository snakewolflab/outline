"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _prosemirrorModel = require("prosemirror-model");
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _editor = require("../editor");
var _models = require("../models");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const limit = 100;
const page = 0;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const work = async page => {
    console.log(`Backfill content… page ${page}`);

    // Retrieve all documents within set limit.
    const documents = await _models.Document.unscoped().findAll({
      attributes: ["id", "urlId", "content", "text", "state"],
      limit,
      offset: page * limit,
      order: [["createdAt", "ASC"]],
      paranoid: false
    });
    for (const document of documents) {
      if (document.content || !document.text) {
        continue;
      }
      console.log(`Writing content for ${document.id}`);
      if ("state" in document && document.state) {
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, document.state);
        document.content = (0, _yProsemirror.yDocToProsemirrorJSON)(ydoc, "default");
      } else {
        const node = _editor.parser.parse(document.text) || _prosemirrorModel.Node.fromJSON(_editor.schema, {});
        document.content = node.toJSON();
      }
      document.changed("content", true);
      await document.save({
        hooks: false,
        silent: true
      });
    }
    return documents.length === limit ? work(page + 1) : undefined;
  };
  await work(page);
  if (exit) {
    console.log("Backfill complete");
    process.exit(0);
  }
}
if (process.env.NODE_ENV !== "test") {
  void main(true);
}