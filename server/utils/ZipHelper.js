"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _tmp = _interopRequireDefault(require("tmp"));
var _yauzl = _interopRequireWildcard(require("yauzl"));
var _files = require("../../shared/utils/files");
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _fs = require("./fs");
var _dec, _class;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const MAX_FILE_NAME_LENGTH = 255;
let ZipHelper = exports.default = (_dec = (0, _tracing.trace)(), _dec(_class = class ZipHelper {
  /**
   * Write a zip file to a temporary disk location.
   *
   * The caller is responsible for adding entries to the `ZipFile`; this method
   * calls `end()` and waits for the output stream to drain to disk.
   *
   * @param zip yazl ZipFile object with entries already added.
   * @returns pathname of the temporary file where the zip was written to disk.
   */
  static async toTmpFile(zip) {
    _Logger.default.debug("utils", "Creating tmp file…");
    return new Promise((resolve, reject) => {
      _tmp.default.file({
        prefix: "export-",
        postfix: ".zip"
      }, (err, filePath) => {
        if (err) {
          return reject(err);
        }
        const handleError = error => {
          dest.destroy();
          _fsExtra.default.remove(filePath).catch(rmErr => {
            _Logger.default.error("Failed to remove tmp file", rmErr);
          }).finally(() => {
            reject(error);
          });
        };
        const dest = _fsExtra.default.createWriteStream(filePath).on("finish", () => {
          _Logger.default.debug("utils", "Writing zip complete", {
            path: filePath
          });
          return resolve(filePath);
        }).on("error", handleError);
        zip.outputStream.on("error", handleError).pipe(dest);
        zip.end();
      });
    });
  }

  /**
   * Iterate through entries in a zip file without extracting it to disk.
   * Entries are visited serially in archive order. `onEntry` may be async; the
   * next entry is only read once the previous handler resolves.
   *
   * @param filePath The file path where the zip is located.
   * @param onEntry Handler invoked for each entry. Skip an entry by returning
   *                without calling `entry.readBuffer(maxSize)`.
   * @returns Promise that resolves once the archive has been fully walked.
   */
  static walk(filePath, onEntry) {
    return new Promise((resolve, reject) => {
      _yauzl.default.open(filePath, {
        lazyEntries: true,
        autoClose: true,
        decodeStrings: false
      }, function (err, zipfile) {
        if (err) {
          return reject(err);
        }
        let settled = false;
        const fail = error => {
          if (settled) {
            return;
          }
          settled = true;
          zipfile.close();
          reject(error);
        };
        zipfile.on("entry", entry => {
          const fileName = Buffer.from(entry.fileName).toString("utf8");
          if ((0, _yauzl.validateFileName)(fileName)) {
            _Logger.default.warn("Invalid zip entry", {
              fileName
            });
            zipfile.readEntry();
            return;
          }
          const handle = {
            fileName,
            uncompressedSize: entry.uncompressedSize,
            isDirectory: /\/$/.test(fileName),
            readBuffer: maxSize => new Promise((res, rej) => {
              if (entry.uncompressedSize > maxSize) {
                return rej(ZipHelper.entryTooLargeError(fileName, maxSize));
              }
              zipfile.openReadStream(entry, (rErr, readStream) => {
                if (rErr) {
                  return rej(rErr);
                }
                const chunks = [];
                let bytesRead = 0;
                let settled = false;
                readStream.on("data", chunk => {
                  bytesRead += chunk.length;
                  if (bytesRead > maxSize) {
                    readStream.destroy(ZipHelper.entryTooLargeError(fileName, maxSize));
                    return;
                  }
                  chunks.push(chunk);
                });
                readStream.on("end", () => {
                  if (!settled) {
                    settled = true;
                    res(Buffer.concat(chunks));
                  }
                });
                readStream.on("error", err => {
                  if (!settled) {
                    settled = true;
                    rej(err);
                  }
                });
                readStream.on("close", () => {
                  if (!settled) {
                    settled = true;
                    rej(new Error(`Stream closed before completing read of ${fileName}`));
                  }
                });
              });
            })
          };
          Promise.resolve().then(() => onEntry(handle)).then(() => {
            if (!settled) {
              zipfile.readEntry();
            }
          }).catch(fail);
        });
        zipfile.on("close", () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        });
        zipfile.on("error", error => fail(error));
        zipfile.readEntry();
      });
    });
  }

  /**
   * Walk a zip file once and build a tree of its entries without extracting
   * to disk. macOS metadata directories (`__MACOSX`) and dotfiles are
   * filtered out at any path segment.
   *
   * The optional `onFile` callback fires once per file entry as it is
   * encountered, with both the materialized tree node and a handle to the
   * raw entry. Callers that need to pre-load contents (e.g. small text
   * files) can call `entry.readBuffer(maxSize)`; callers that only need the tree
   * structure can omit the callback entirely.
   *
   * @param filePath Local filesystem path to the zip.
   * @param onFile Optional per-file hook; not called for directory entries.
   * @returns A synthetic root node whose `children` are the zip's top-level
   *          entries.
   */
  static async toFileTree(filePath, onFile) {
    const root = {
      name: "",
      title: "",
      pathInZip: "",
      children: []
    };
    const isFiltered = segment => segment === "__MACOSX" || segment.startsWith(".");
    const nodesByPath = new Map();
    const resolveNode = entryName => {
      // Drop empty segments and the path-no-op `.` (e.g. entries written as
      // `./Collection/page.md`). `..` is preserved so the dotfile filter
      // below rejects it — we never resolve path traversal in zip entries.
      const segments = entryName.split("/").filter(s => s !== "" && s !== ".");
      if (segments.length === 0) {
        return null;
      }
      let current = root;
      let pathSoFar = "";
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (isFiltered(segment)) {
          return null;
        }
        pathSoFar = pathSoFar ? `${pathSoFar}/${segment}` : segment;
        let next = nodesByPath.get(pathSoFar);
        if (!next) {
          next = {
            name: segment,
            title: (0, _fs.deserializeFilename)(_nodePath.default.parse(segment).name),
            pathInZip: pathSoFar,
            children: []
          };
          current.children.push(next);
          nodesByPath.set(pathSoFar, next);
        }
        current = next;
      }
      return current;
    };
    await this.walk(filePath, async entry => {
      const node = resolveNode(entry.fileName);
      if (!node || entry.isDirectory) {
        return;
      }
      if (onFile) {
        await onFile(node, entry);
      }
    });
    return root;
  }

  /**
   * Write a zip file to a disk location
   *
   * @param filePath The file path where the zip is located
   * @param outputDir The directory where the zip should be extracted
   */
  static extract(filePath, outputDir) {
    return new Promise((resolve, reject) => {
      _Logger.default.debug("utils", "Opening zip file", {
        filePath
      });
      _yauzl.default.open(filePath, {
        lazyEntries: true,
        autoClose: true,
        // Filenames are validated inside on("entry") handler instead of within yauzl as some
        // otherwise valid zip files (including those in our test suite) include / path. We can
        // safely read but skip writing these.
        // see: https://github.com/thejoshwolfe/yauzl/issues/135
        decodeStrings: false
      }, function (err, zipfile) {
        if (err) {
          return reject(err);
        }
        try {
          zipfile.readEntry();
          zipfile.on("entry", function (entry) {
            const filePath = Buffer.from(entry.fileName).toString("utf8");
            _Logger.default.debug("utils", "Extracting zip entry", {
              filePath
            });
            const processNext = error => {
              if (error) {
                zipfile.close();
                reject(error);
                return;
              }
              zipfile.readEntry();
            };
            if ((0, _yauzl.validateFileName)(filePath)) {
              _Logger.default.warn("Invalid zip entry", {
                filePath
              });
              processNext();
              return;
            }
            if (/\/$/.test(filePath)) {
              // directory file names end with '/'
              _fsExtra.default.mkdirp(_nodePath.default.join(outputDir, filePath), mkErr => processNext(mkErr));
            } else {
              // file entry
              zipfile.openReadStream(entry, function (rErr, readStream) {
                if (rErr) {
                  return processNext(rErr);
                }
                // ensure parent directory exists
                _fsExtra.default.mkdirp(_nodePath.default.join(outputDir, _nodePath.default.dirname(filePath)), function (mkErr) {
                  if (mkErr) {
                    return processNext(mkErr);
                  }
                  const fileName = (0, _fs.trimFilenameAndExt)(_nodePath.default.basename(filePath), MAX_FILE_NAME_LENGTH);
                  const resolvedOutput = _nodePath.default.resolve(outputDir);
                  const location = _nodePath.default.resolve(resolvedOutput, _nodePath.default.dirname(filePath), fileName);
                  if (location !== resolvedOutput && !location.startsWith(resolvedOutput + _nodePath.default.sep)) {
                    _Logger.default.warn("Zip entry escapes extraction directory", {
                      filePath,
                      location
                    });
                    readStream.destroy();
                    return processNext();
                  }
                  const dest = _fsExtra.default.createWriteStream(location).on("error", error => {
                    readStream.destroy();
                    dest.destroy();
                    processNext(error);
                  });
                  readStream.on("error", error => {
                    dest.destroy();
                    readStream.destroy();
                    processNext(error);
                  }).on("end", function () {
                    processNext();
                  }).pipe(dest);
                });
              });
            }
          });
          zipfile.on("close", resolve);
          zipfile.on("error", error => {
            zipfile.close();
            reject(error);
          });
        } catch (zErr) {
          if (zipfile) {
            zipfile.close();
          }
          reject(zErr);
        }
      });
    });
  }
  static entryTooLargeError(fileName, maxSize) {
    return (0, _errors.ValidationError)(`${fileName} is too large - the maximum size is ${(0, _files.bytesToHumanReadable)(maxSize)}`);
  }
}) || _class);