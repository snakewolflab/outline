"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeBuffer = require("node:buffer");
var _promises = require("node:fs/promises");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeStream = require("node:stream");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _invariant = _interopRequireDefault(require("invariant"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _resolvePath = _interopRequireDefault(require("resolve-path"));
var _error = require("../../../shared/utils/error");
var _env = _interopRequireDefault(require("../../env"));
var _errors = require("../../errors");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _BaseStorage = _interopRequireDefault(require("./BaseStorage"));
var _constants = require("../../../shared/constants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class LocalStorage extends _BaseStorage.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "store", async _ref => {
      let {
        body,
        key
      } = _ref;
      const exists = await _fsExtra.default.pathExists(this.getFilePath(key));
      if (exists) {
        throw (0, _errors.ValidationError)(`File already exists at ${key}`);
      }
      await (0, _promises.mkdir)(this.getFilePath(_nodePath.default.dirname(key)), {
        recursive: true
      });
      let src;
      if (body instanceof _fsExtra.default.ReadStream) {
        src = body;
      } else if (body instanceof _nodeBuffer.Blob) {
        src = _nodeStream.Readable.from(Buffer.from(await body.arrayBuffer()));
      } else {
        src = _nodeStream.Readable.from(body);
      }
      const filePath = this.getFilePath(key);

      // Create the file on disk first
      await _fsExtra.default.createFile(filePath);
      return new Promise((resolve, reject) => {
        const dest = _fsExtra.default.createWriteStream(filePath).on("error", reject).on("finish", () => resolve(this.getUrlForKey(key)));
        src.on("error", err => {
          dest.end();
          reject(err);
        }).pipe(dest);
      });
    });
    _defineProperty(this, "getSignedUrl", async function (key) {
      let expiresIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LocalStorage.defaultSignedUrlExpires;
      const sig = _jsonwebtoken.default.sign({
        key,
        type: "attachment"
      }, _env.default.SECRET_KEY, {
        expiresIn
      });
      return Promise.resolve(`${_env.default.URL}/api/files.get?sig=${sig}`);
    });
  }
  async getPresignedPost(ctx, key, acl, maxUploadSize) {
    let contentType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "image";
    return Promise.resolve({
      url: this.getUrlForKey(key),
      fields: {
        key,
        acl,
        maxUploadSize: String(maxUploadSize),
        contentType,
        [_constants.CSRF.fieldName]: ctx.cookies.get(_constants.CSRF.cookieName) || ""
      }
    });
  }
  getUploadUrl() {
    return "/api/files.create";
  }
  getUrlForKey(key) {
    return `/api/files.get?key=${key}`;
  }
  async deleteFile(key) {
    const filePath = this.getFilePath(key);
    try {
      await (0, _promises.unlink)(filePath);
    } catch (err) {
      _Logger.default.warn(`Couldn't delete ${filePath}`, {
        error: err
      });
      return;
    }
    const directory = _nodePath.default.dirname(filePath);
    try {
      await (0, _promises.rmdir)(directory);
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === "ENOTEMPTY") {
        return;
      }
      _Logger.default.warn(`Couldn't delete directory ${directory}`, {
        error: err
      });
    }
  }
  async getFileHandle(key) {
    return {
      path: this.getFilePath(key),
      cleanup: async () => {
        // no-op, as we're reading the canonical file directly
      }
    };
  }
  async getFileStream(key, range) {
    const filePath = this.getFilePath(key);
    const exists = await _fsExtra.default.pathExists(filePath);
    if (!exists) {
      throw (0, _errors.InternalError)(`File not found at ${key}`);
    }
    if (range) {
      if (typeof range.start !== "number" || typeof range.end !== "number" || range.start < 0 || range.end < range.start) {
        throw (0, _errors.ValidationError)("Invalid range specified");
      }
    }
    try {
      return _fsExtra.default.createReadStream(filePath, range);
    } catch (err) {
      _Logger.default.error(`Failed to create read stream`, (0, _error.toError)(err), {
        filePath
      });
      throw (0, _errors.ValidationError)("Unable to read file");
    }
  }
  stat(key) {
    return _fsExtra.default.stat(this.getFilePath(key));
  }
  getFileExists(key) {
    return _fsExtra.default.pathExists(this.getFilePath(key));
  }
  moveFile(fromKey, toKey) {
    return _fsExtra.default.move(this.getFilePath(fromKey), this.getFilePath(toKey));
  }
  getFilePath(key) {
    (0, _invariant.default)(_env.default.FILE_STORAGE_LOCAL_ROOT_DIR, "FILE_STORAGE_LOCAL_ROOT_DIR is required");
    return (0, _resolvePath.default)(_env.default.FILE_STORAGE_LOCAL_ROOT_DIR, key);
  }
}
exports.default = LocalStorage;