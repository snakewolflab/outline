"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocumentConverter = void 0;
var _compat = require("es-toolkit/compat");
var _prosemirrorModel = require("prosemirror-model");
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _editor = require("../editor");
var _errors = require("../errors");
var _tracing = require("../logging/tracing");
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
let DocumentConverter = exports.DocumentConverter = (_dec = (0, _tracing.trace)(), _dec(_class = class DocumentConverter {
  /**
   * Convert an incoming file to a structured document result.
   *
   * @param content The content of the file.
   * @param fileName The name of the file, including extension.
   * @param mimeType The mime type of the file.
   * @returns The converted document with text, data, title, and icon.
   */
  static async convert(content, fileName, mimeType) {
    let doc;

    // Route to appropriate conversion method
    const html = await this.convertToHtml(content, fileName, mimeType);
    if (html !== undefined) {
      doc = await this.htmlToProsemirror(html);
    } else {
      const markdown = await this.convertToMarkdown(content, fileName, mimeType);
      doc = _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(markdown);
    }

    // Extract title from first H1 heading
    let title = "";
    const headings = _ProsemirrorHelper.ProsemirrorHelper.getHeadings(doc);
    if (headings.length > 0 && headings[0].level === 1) {
      title = headings[0].title;
      doc = _ProsemirrorHelper.ProsemirrorHelper.removeFirstHeading(doc);
    }

    // Extract emoji from start of document
    const {
      emoji: icon,
      doc: docWithoutEmoji
    } = _ProsemirrorHelper.ProsemirrorHelper.extractEmojiFromStart(doc);
    doc = docWithoutEmoji;

    // Serialize to markdown and trim whitespace
    const text = _editor.serializer.serialize(doc).trim();
    return {
      text,
      doc,
      title,
      icon
    };
  }

  /**
   * Convert HTML content directly to a Prosemirror document node.
   *
   * @param content The HTML content as a string or Buffer.
   * @returns A Prosemirror Node representing the document.
   */
  static async htmlToProsemirror(content) {
    if (typeof content !== "string") {
      content = content.toString("utf8");
    }

    // Loaded lazily to keep jsdom off the startup path — only HTML imports need it.
    const {
      JSDOM
    } = await Promise.resolve().then(() => _interopRequireWildcard(require("jsdom")));
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Remove problematic elements before parsing
    const elementsToRemove = document.querySelectorAll("script, style, title, head, meta, link");
    elementsToRemove.forEach(el => el.remove());

    // Preprocess the DOM to handle edge cases
    this.preprocessHtmlForImport(document);

    // Patch global environment for Prosemirror DOMParser
    const cleanup = _ProsemirrorHelper.ProsemirrorHelper.patchGlobalEnv(dom.window);
    try {
      const domParser = _prosemirrorModel.DOMParser.fromSchema(_editor.schema);
      return domParser.parse(document.body);
    } finally {
      cleanup();
    }
  }

  /**
   * Preprocesses HTML DOM before Prosemirror parsing to cleanup
   * images and other elements.
   *
   * @param document The DOM document to preprocess.
   */
  static preprocessHtmlForImport(document) {
    // Handle images: filter emoticons, remove Jira icons, apply Confluence sizing
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      const className = img.className || "";

      // Skip emoticon images (they'll be dropped)
      if (className.includes("emoticon")) {
        img.remove();
        return;
      }

      // Remove Jira icon images
      if (className === "icon" && img.parentElement?.className.includes("jira-issue-key")) {
        img.remove();
        return;
      }

      // Handle Confluence image sizing: data-width/data-height → width/height
      const dataWidth = img.getAttribute("data-width");
      const dataHeight = img.getAttribute("data-height");
      const width = img.getAttribute("width");
      if (dataWidth && dataHeight && width) {
        const ratio = parseInt(dataWidth) / parseInt(width);
        const calculatedHeight = Math.round(parseInt(dataHeight) / ratio);
        img.setAttribute("height", String(calculatedHeight));
      }

      // Extract dimensions from data URI images that lack width/height
      // (e.g. images embedded by mammoth during docx import).
      // Only decode a small prefix of the base64 data — headers for all
      // supported formats live within the first 64 KB of the file.
      if (!img.getAttribute("width") && !img.getAttribute("height")) {
        const src = img.getAttribute("src") || "";
        if (src.startsWith("data:") && src.includes(";base64,")) {
          const base64Start = src.indexOf(";base64,") + 8;
          // 4 base64 chars → 3 bytes; decode at most ~64 KB of image data.
          const maxBase64Chars = Math.ceil(65536 / 3) * 4;
          const base64Prefix = src.slice(base64Start, base64Start + maxBase64Chars);
          const dimensions = this.getImageDimensionsFromBuffer(Buffer.from(base64Prefix, "base64"));
          if (dimensions) {
            img.setAttribute("width", String(dimensions.width));
            img.setAttribute("height", String(dimensions.height));
          }
        }
      }
    });
  }

  /**
   * Attempts to convert content to HTML for formats that support it.
   * Returns undefined for formats that should be parsed as markdown directly.
   *
   * @param content The content of the file.
   * @param fileName The name of the file, including extension.
   * @param mimeType The mime type of the file.
   * @returns HTML string if convertible, undefined otherwise.
   */
  static async convertToHtml(content, fileName, mimeType) {
    // First try to convert based on the mime type
    switch (mimeType) {
      case "text/html":
        return typeof content === "string" ? content : content.toString("utf8");
      case "application/msword":
        return this.confluenceToHtml(content);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.docxToHtml(content);
      default:
        break;
    }

    // Try to convert based on the file extension
    const extension = fileName.split(".").pop();
    switch (extension) {
      case "html":
        return typeof content === "string" ? content : content.toString("utf8");
      case "docx":
        return this.docxToHtml(content);
      default:
        return undefined;
    }
  }

  /**
   * Converts content to markdown for text-based formats.
   *
   * @param content The content of the file.
   * @param fileName The name of the file, including extension.
   * @param mimeType The mime type of the file.
   * @returns Markdown string.
   */
  static async convertToMarkdown(content, fileName, mimeType) {
    let markdown;
    switch (mimeType) {
      case "text/plain":
      case "text/markdown":
        markdown = this.bufferToString(content);
        break;
      case "text/csv":
        return this.csvToMarkdown(content);
      default:
        {
          const extension = fileName.split(".").pop();
          switch (extension) {
            case "md":
            case "markdown":
              markdown = this.bufferToString(content);
              break;
            default:
              throw (0, _errors.FileImportError)(`File type ${mimeType} not supported`);
          }
        }
    }

    // Process frontmatter and convert it to a YAML codeblock
    return this.processFrontmatter(markdown);
  }

  /**
   * Convert a docx file to HTML using mammoth.
   *
   * @param content The docx file content as a Buffer.
   * @returns The HTML representation of the document.
   */
  static async docxToHtml(content) {
    if (content instanceof Buffer) {
      // Loaded lazily to keep mammoth off the startup path — only docx imports need it.
      const mammoth = (await Promise.resolve().then(() => _interopRequireWildcard(require("mammoth")))).default;
      const {
        value
      } = await (0, _tracing.traceFunction)({
        spanName: "convertToHtml"
      })(mammoth.convertToHtml)({
        buffer: content
      });
      return value;
    }
    throw (0, _errors.FileImportError)("Unsupported Word file");
  }

  /**
   * Convert a Confluence Word export to HTML.
   *
   * @param content The Confluence Word export content.
   * @returns The HTML representation of the document.
   */
  static async confluenceToHtml(content) {
    if (typeof content !== "string") {
      content = content.toString("utf8");
    }

    // We're only supporting the output from Confluence here, regular Word documents should call
    // into the docxToHtml importer. See: https://jira.atlassian.com/browse/CONFSERVER-38237
    if (!content.includes("Content-Type: multipart/related")) {
      throw (0, _errors.FileImportError)("Unsupported Word file");
    }

    // Confluence "Word" documents are actually just multi-part email messages, so we can use
    // mailparser to parse the content. Loaded lazily to keep mailparser off the startup path —
    // only Confluence Word imports need it.
    const {
      simpleParser
    } = await Promise.resolve().then(() => _interopRequireWildcard(require("mailparser")));
    const parsed = await simpleParser(content);
    if (!parsed.html) {
      throw (0, _errors.FileImportError)("Unsupported Word file (No content found)");
    }
    let html = parsed.html;

    // Replace the content-location with a data URI for each attachment.
    for (const attachment of parsed.attachments) {
      const contentLocation = attachment.headers.get("content-location") ?? "";
      const id = contentLocation.split("/").pop();
      if (!id) {
        continue;
      }
      html = html.replace(new RegExp((0, _compat.escapeRegExp)(id), "g"), `data:image/png;base64,${attachment.content.toString("base64")}`);
    }
    return html;
  }

  /**
   * Convert a CSV file to a markdown table.
   *
   * @param content The CSV file content.
   * @returns A markdown table representation.
   */
  static async csvToMarkdown(content) {
    // Loaded lazily to keep @fast-csv off the startup path — only CSV imports need it.
    const {
      parse
    } = await Promise.resolve().then(() => _interopRequireWildcard(require("@fast-csv/parse")));
    return new Promise((resolve, reject) => {
      const text = this.bufferToString(content).trim();
      const textLines = text.split("\n");

      // Find the first non-empty line to determine the delimiter
      const firstNonEmptyLine = textLines.find(line => line.trim().length > 0) || "";

      // Determine the separator used in the CSV file based on number of occurrences of each separator on first line
      const delimiter = [";", ",", "\t"].reduce((acc, separator) => {
        const count = (firstNonEmptyLine.match(new RegExp((0, _compat.escapeRegExp)(separator), "g")) || []).length;
        return count > acc.count ? {
          count,
          separator
        } : acc;
      }, {
        count: 0,
        separator: ","
      }).separator;
      const lines = [];
      const stream = parse({
        delimiter
      }).on("error", error => {
        reject((0, _errors.FileImportError)(`There was an error parsing the CSV file: ${error}`));
      }).on("data", row => lines.push(row)).on("end", () => {
        // Filter out completely empty rows
        const nonEmptyLines = lines.filter(row => row.some(cell => cell.trim() !== ""));
        if (nonEmptyLines.length === 0) {
          resolve("");
          return;
        }

        // Check if all rows have a trailing empty cell (trailing comma artifact)
        // Only trim if ALL non-empty rows end with an empty cell
        let trimmedLines = nonEmptyLines;
        while (trimmedLines.length > 0 && trimmedLines.every(row => row.length > 0 && row[row.length - 1].trim() === "")) {
          trimmedLines = trimmedLines.map(row => row.slice(0, -1));
        }

        // Find the most common column count
        const columnCounts = new Map();
        for (const row of trimmedLines) {
          if (row.length > 0) {
            columnCounts.set(row.length, (columnCounts.get(row.length) || 0) + 1);
          }
        }

        // Get the column count that appears most frequently
        let expectedColumns = 0;
        let maxFrequency = 0;
        for (const [count, frequency] of columnCounts) {
          if (frequency > maxFrequency) {
            maxFrequency = frequency;
            expectedColumns = count;
          }
        }

        // Find the first row with the expected column count (this is the header)
        const headerIndex = trimmedLines.findIndex(row => row.length === expectedColumns);
        if (headerIndex === -1) {
          resolve("");
          return;
        }
        const headers = trimmedLines[headerIndex];
        const dataRows = trimmedLines.slice(headerIndex + 1).filter(row => row.length === expectedColumns);
        const table = dataRows.map(cells => `| ${cells.join(" | ")} |`).join("\n");
        const headerLine = `| ${headers.join(" | ")} |`;
        const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
        resolve(`${headerLine}\n${separatorLine}\n${table}\n`);
      });
      stream.write(text);
      stream.end();
    });
  }

  /**
   * Convert a Buffer to a string.
   *
   * @param content The content as a Buffer or string.
   * @returns The content as a string.
   */
  static bufferToString(content) {
    return typeof content === "string" ? content : content.toString("utf8");
  }

  /**
   * Parse and convert frontmatter to a YAML codeblock.
   *
   * @param content The markdown content that may contain frontmatter.
   * @returns The markdown content with frontmatter converted to a YAML codeblock.
   */
  static processFrontmatter(content) {
    // Frontmatter must start at the beginning of the document
    const frontmatterRegex = /^---\n([\s\S]*?)\n---(?:\n|$)/;
    const match = content.match(frontmatterRegex);
    if (!match) {
      return content;
    }
    const frontmatterContent = match[1];
    const remainingContent = content.slice(match[0].length);

    // Validate that the frontmatter is valid YAML
    try {
      _jsYaml.default.load(frontmatterContent);
    } catch {
      // If it's not valid YAML, return content unchanged
      return content;
    }

    // Convert frontmatter to a YAML codeblock
    const codeBlockDelimiter = "```";
    const yamlCodeblock = `${codeBlockDelimiter}yaml\n${frontmatterContent}\n${codeBlockDelimiter}\n\n`;
    return yamlCodeblock + remainingContent;
  }

  /**
   * Parse image dimensions from a binary buffer. Supports PNG, JPEG, and GIF.
   *
   * @param buffer The image data.
   * @returns The width and height if parseable, otherwise undefined.
   */
  static getImageDimensionsFromBuffer(buffer) {
    try {
      // PNG: signature + IHDR chunk
      if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return {
          width: buffer.readUInt32BE(16),
          height: buffer.readUInt32BE(20)
        };
      }

      // GIF: signature + logical screen descriptor
      if (buffer.length >= 10 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return {
          width: buffer.readUInt16LE(6),
          height: buffer.readUInt16LE(8)
        };
      }

      // JPEG: scan for SOF marker (cap at 64 KB to bound work)
      if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
        const scanLimit = Math.min(buffer.length, 65536);
        let offset = 2;
        while (offset + 1 < scanLimit) {
          if (buffer[offset] !== 0xff) {
            offset++;
            continue;
          }
          const marker = buffer[offset + 1];
          offset += 2;

          // Standalone markers without a payload
          if (marker === 0x00 || marker === 0x01 || marker >= 0xd0 && marker <= 0xd9) {
            continue;
          }
          if (offset + 2 > scanLimit) {
            break;
          }
          const segmentLength = buffer.readUInt16BE(offset);

          // SOF markers contain the frame dimensions — check before
          // the advance guard since this returns immediately.
          if (marker >= 0xc0 && marker <= 0xc3 || marker >= 0xc5 && marker <= 0xc7 || marker >= 0xc9 && marker <= 0xcb || marker >= 0xcd && marker <= 0xcf) {
            if (offset + 7 <= buffer.length) {
              return {
                height: buffer.readUInt16BE(offset + 3),
                width: buffer.readUInt16BE(offset + 5)
              };
            }
            break;
          }

          // Length includes itself and must be >= 2; bail on malformed data.
          if (segmentLength < 2 || offset + segmentLength > buffer.length) {
            break;
          }
          offset += segmentLength;
        }
      }
    } catch {
      // Return undefined if parsing fails
    }
    return undefined;
  }
}) || _class);