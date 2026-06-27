"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _fs = require("./fs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ImportHelper {
  /**
   * Collects the files and folders for a directory filePath.
   */
  static async toFileTree(filePath) {
    let currentDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    const name = _nodePath.default.basename(filePath);
    const title = (0, _fs.deserializeFilename)(_nodePath.default.parse(_nodePath.default.basename(name)).name);
    const item = {
      path: filePath,
      name,
      title,
      children: []
    };
    let stats;

    // Ignore macOS metadata directories and hidden files
    if (name === "__MACOSX" || name.startsWith(".")) {
      return null;
    }
    try {
      stats = await _fsExtra.default.stat(filePath);
    } catch (_err) {
      return null;
    }
    if (stats.isFile()) {
      return item;
    }
    if (stats.isDirectory()) {
      const dirData = await _fsExtra.default.readdir(filePath);
      if (dirData === null) {
        return null;
      }
      item.children = (await Promise.all(dirData.map(child => this.toFileTree(_nodePath.default.join(filePath, child), currentDepth + 1)))).filter(Boolean);
    } else {
      return null;
    }
    return item;
  }
}
exports.default = ImportHelper;