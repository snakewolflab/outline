"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _editor = require("../../editor");
var _models = require("../../models");
var _DocumentHelper = require("../../models/helpers/DocumentHelper");
var _BaseTask = require("./base/BaseTask");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
class DocumentUpdateTextTask extends _BaseTask.BaseTask {
  async perform(event) {
    const document = await _models.Document.findByPk(event.documentId);
    if (!document?.content) {
      return;
    }
    const node = _prosemirrorModel.Node.fromJSON(_editor.schema, document.content);
    document.text = _editor.serializer.serialize(node);

    // Loaded lazily to keep the language-detection corpus off the startup path —
    // only this worker task needs it.
    const [{
      franc
    }, {
      iso6393To1
    }] = await Promise.all([Promise.resolve().then(() => _interopRequireWildcard(require("franc"))), Promise.resolve().then(() => _interopRequireWildcard(require("iso-639-3")))]);
    const language = franc(_DocumentHelper.DocumentHelper.toPlainText(document), {
      minLength: 50
    });
    document.language = iso6393To1[language];
    await document.save({
      silent: true
    });
  }
}
exports.default = DocumentUpdateTextTask;