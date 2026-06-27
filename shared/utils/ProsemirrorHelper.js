"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachmentRedirectRegex = exports.attachmentPublicRegex = exports.ProsemirrorHelper = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _headingToSlug = _interopRequireDefault(require("../editor/lib/headingToSlug"));
var _textBetween = _interopRequireDefault(require("../editor/lib/textBetween"));
var _TextHelper = require("./TextHelper");
var _env = _interopRequireDefault(require("../env"));
var _findChildren = require("../editor/queries/findChildren");
var _Lightbox = require("../editor/lib/Lightbox");
var _EditorStyleHelper = require("../editor/styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const attachmentRedirectRegex = exports.attachmentRedirectRegex = /\/api\/attachments\.redirect\?id=(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
const attachmentPublicRegex = exports.attachmentPublicRegex = /public\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
class ProsemirrorHelper {
  /**
   * Remove specific mark types from all nodes in the document.
   *
   * @param doc the prosemirror document or JSON data.
   * @param marks the mark type names to remove.
   * @returns the document data with specified marks removed.
   */
  static removeMarks(doc, marks) {
    const json = "toJSON" in doc ? doc.toJSON() : doc;
    const markSet = new Set(marks);
    function removeMarksInner(node) {
      if (node.marks) {
        node.marks = node.marks.filter(mark => !markSet.has(mark.type));
      }
      if (node.attrs?.marks) {
        node.attrs.marks = node.attrs.marks?.filter(mark => !markSet.has(mark.type));
      }
      if (node.content) {
        node.content.forEach(removeMarksInner);
      }
      return node;
    }
    return removeMarksInner(json);
  }

  /**
   * Get a new empty document.
   *
   * @returns a new empty document as JSON.
   */
  static getEmptyDocument() {
    return {
      type: "doc",
      content: [{
        content: [],
        type: "paragraph"
      }]
    };
  }

  /**
   * Returns true if the data looks like an empty document.
   *
   * @param data The ProsemirrorData to check.
   * @returns True if the document is empty.
   */
  static isEmptyData(data) {
    if (data.type !== "doc") {
      return false;
    }
    if (data.content?.length === 1) {
      const node = data.content[0];
      return node.type === "paragraph" && (node.content === null || node.content === undefined || node.content.length === 0);
    }
    return !data.content || data.content.length === 0;
  }

  /**
   * Returns the node as plain text.
   *
   * @param node The node to convert.
   * @param schema The schema to use.
   * @returns The document content as plain text without formatting.
   */
  static toPlainText(root) {
    return (0, _textBetween.default)(root, 0, root.content.size);
  }

  /**
   * Removes any empty paragraphs from the beginning and end of the document.
   *
   * @returns True if the editor is empty
   */
  static trim(doc) {
    let index = 0,
      start = 0,
      end = doc.nodeSize - 2,
      isEmpty;
    if (doc.childCount <= 1) {
      return doc;
    }
    isEmpty = true;
    while (isEmpty) {
      const node = doc.maybeChild(index++);
      if (!node) {
        break;
      }
      isEmpty = ProsemirrorHelper.toPlainText(node).trim() === "";
      if (isEmpty) {
        start += node.nodeSize;
      }
    }
    index = doc.childCount - 1;
    isEmpty = true;
    while (isEmpty) {
      const node = doc.maybeChild(index--);
      if (!node) {
        break;
      }
      isEmpty = ProsemirrorHelper.toPlainText(node).trim() === "";
      if (isEmpty) {
        end -= node.nodeSize;
      }
    }
    return doc.cut(start, end);
  }

  /**
   * Returns true if the trimmed content of the passed document is an empty string.
   *
   * @returns True if the editor is empty
   */
  static isEmpty(doc, schema) {
    if (!schema) {
      return !doc || doc.textContent.trim() === "";
    }
    let empty = true;
    doc.descendants(child => {
      // If we've already found non-empty data, we can stop descending further
      if (!empty) {
        return false;
      }
      if (child.type.spec.leafText) {
        empty = !child.type.spec.leafText(child).trim();
      } else if (child.isText) {
        empty = !child.text?.trim();
      }
      return empty;
    });
    return empty;
  }

  /**
   * Iterates through the document to find all of the comments that exist as marks.
   *
   * @param doc Prosemirror document node
   * @returns Array<CommentMark>
   */
  static getComments(doc) {
    const comments = [];
    doc.descendants(node => {
      node.marks.forEach(mark => {
        if (mark.type.name === "comment") {
          comments.push({
            ...mark.attrs,
            text: node.textContent
          });
        }
      });
      (node.attrs.marks ?? []).forEach(mark => {
        if (mark.type === "comment") {
          comments.push({
            ...mark.attrs,
            // For image nodes, we don't have any text content, so we set it to an empty string
            text: ""
          });
        }
      });
      return true;
    });
    return comments;
  }
  static getAnchorsForHeadingNodes(doc) {
    const previouslySeen = {};
    const anchors = [];
    doc.descendants((node, pos) => {
      if (node.type.name !== "heading") {
        return;
      }

      // calculate the optimal id
      const slug = (0, _headingToSlug.default)(node);
      let id = slug;

      // check if we've already used it, and if so how many times?
      // Make the new id based on that number ensuring that we have
      // unique ID's even when headings are identical
      if (previouslySeen[slug] > 0) {
        id = (0, _headingToSlug.default)(node, previouslySeen[slug]);
      }

      // record that we've seen this slug for the next loop
      previouslySeen[slug] = previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;
      anchors.push({
        pos,
        id,
        className: _EditorStyleHelper.EditorStyleHelper.headingPositionAnchor
      });
    });
    return anchors;
  }
  static getAnchorsForImageNodes(doc) {
    const anchors = [];
    doc.descendants((node, pos) => {
      if (Array.isArray(node.attrs?.marks)) {
        node.attrs.marks.forEach(mark => {
          if (mark?.type === "comment" && mark?.attrs?.id) {
            anchors.push({
              pos,
              id: `comment-${mark.attrs.id}`,
              className: _EditorStyleHelper.EditorStyleHelper.imagePositionAnchor
            });
          }
        });
      }
    });
    return anchors;
  }
  static getAnchors(doc) {
    return [...ProsemirrorHelper.getAnchorsForHeadingNodes(doc), ...ProsemirrorHelper.getAnchorsForImageNodes(doc)];
  }

  /**
   * Returns the ids of comment marks attached to the node at the given position.
   *
   * @param doc Prosemirror document node.
   * @param pos Position of the node within the document.
   * @returns array of comment ids anchored to the node.
   */
  static getCommentIdsAtPos(doc, pos) {
    const node = doc.nodeAt(pos);
    if (!node || !Array.isArray(node.attrs?.marks)) {
      return [];
    }
    return node.attrs.marks.filter(mark => mark?.type === "comment" && !!mark?.attrs?.id).map(mark => mark.attrs.id);
  }

  /**
   * Builds the consolidated anchor text for the given comment-id.
   *
   * @param marks all available comment marks in a document.
   * @param commentId the comment-id to build the anchor text.
   * @returns consolidated anchor text.
   */
  static getAnchorTextForComment(marks, commentId) {
    const anchorTexts = marks.filter(mark => mark.id === commentId).map(mark => mark.text);
    return anchorTexts.length ? anchorTexts.join("") : undefined;
  }

  /**
   * Iterates through the document to find all of the images.
   *
   * @param doc Prosemirror document node
   * @returns Array<Node> of images
   */
  static getImages(doc) {
    const images = [];
    doc.descendants(node => {
      if (node.type.name === "image") {
        images.push(node);
      }
      return true;
    });
    return images;
  }

  /**
   * Iterates through the document to find all valid Lightbox nodes.
   *
   * @param doc Prosemirror document node
   * @returns Array<NodeWithPos> of nodes allowed in Lightbox
   */

  /**
   * Iterates through the document to find all of the videos.
   *
   * @param doc Prosemirror document node
   * @returns Array<Node> of videos
   */
  static getVideos(doc) {
    const videos = [];
    doc.descendants(node => {
      if (node.type.name === "video") {
        videos.push(node);
      }
      return true;
    });
    return videos;
  }

  /**
   * Iterates through the document to find all of the attachments.
   *
   * @param doc Prosemirror document node
   * @returns Array<Node> of attachments
   */
  static getAttachments(doc) {
    const attachments = [];
    doc.descendants(node => {
      if (node.type.name === "attachment") {
        attachments.push(node);
      }
      return true;
    });
    return attachments;
  }

  /**
   * Iterates through the document to find all of the tasks and their completion state.
   *
   * @param doc Prosemirror document node
   * @returns Array<Task>
   */
  static getTasks(doc) {
    const tasks = [];
    doc.descendants(node => {
      if (!node.isBlock) {
        return false;
      }
      if (node.type.name === "checkbox_list") {
        node.content.forEach(listItem => {
          let text = "";
          listItem.forEach(contentNode => {
            if (contentNode.type.name === "paragraph") {
              text += contentNode.textContent;
            }
          });
          tasks.push({
            text,
            completed: listItem.attrs.checked
          });
        });
      }
      return true;
    });
    return tasks;
  }

  /**
   * Returns a summary of total and completed tasks in the node.
   *
   * @param doc Prosemirror document node
   * @returns Object with completed and total keys
   */
  static getTasksSummary(doc) {
    let completed = 0;
    let total = 0;
    doc.descendants(node => {
      if (!node.isBlock) {
        return false;
      }
      if (node.type.name === "checkbox_list") {
        node.content.forEach(listItem => {
          total++;
          if (listItem.attrs.checked) {
            completed++;
          }
        });
      }
      return true;
    });
    return {
      completed,
      total
    };
  }

  /**
   * Iterates through the document to find all of the headings and their level.
   *
   * @param doc Prosemirror document node
   * @returns Array<Heading>
   */
  static getHeadings(doc) {
    const headings = [];
    const previouslySeen = {};
    doc.descendants(node => {
      if (node.type.name === "heading") {
        // calculate the optimal id
        const id = (0, _headingToSlug.default)(node);
        let name = id;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[id] > 0) {
          name = (0, _headingToSlug.default)(node, previouslySeen[id]);
        }

        // record that we've seen this id for the next loop
        previouslySeen[id] = previouslySeen[id] !== undefined ? previouslySeen[id] + 1 : 1;
        headings.push({
          title: ProsemirrorHelper.toPlainText(node),
          level: node.attrs.level,
          id: name
        });
      }
    });
    return headings;
  }

  /**
   * Converts all attachment URLs in the ProsemirrorData to absolute URLs.
   * This is useful for ensuring that attachments can be accessed correctly
   * when the document is rendered in a different context or environment.
   *
   * @param data The ProsemirrorData object to process
   * @returns The ProsemirrorData with absolute URLs for attachments
   */
  static attachmentsToAbsoluteUrls(data) {
    const regex = new RegExp("^" + attachmentRedirectRegex.source);
    function replace(node) {
      if (node.type === "image" && node.attrs?.src && regex.test(node.attrs.src)) {
        node.attrs.src = _env.default.URL + node.attrs.src;
      } else if (node.type === "video" && node.attrs?.src && regex.test(node.attrs.src)) {
        node.attrs.src = _env.default.URL + node.attrs.src;
      } else if (node.type === "attachment" && node.attrs?.href && regex.test(node.attrs.href)) {
        node.attrs.href = _env.default.URL + node.attrs.href;
      }
      if (node.content) {
        node.content = node.content.filter(Boolean);
        node.content.forEach(replace);
      }
      return node;
    }
    return replace(data);
  }

  /**
   * Replaces all template variables in the node.
   *
   * @param data The ProsemirrorData object to replace variables in
   * @param user The user to use for replacing variables
   * @returns The content with variables replaced
   */
  static replaceTemplateVariables(data, user) {
    function replace(node) {
      if (node.type === "text" && node.text) {
        node.text = _TextHelper.TextHelper.replaceTemplateVariables(node.text, user);
      }
      if (node.content) {
        node.content = node.content.filter(Boolean);
        node.content.forEach(replace);
      }
      return node;
    }
    return replace(data);
  }

  /**
   * Returns the paragraphs from the data if there are only plain paragraphs
   * without any formatting. Otherwise returns undefined.
   *
   * @param data The ProsemirrorData object or ProsemirrorNode
   * @returns An array of paragraph nodes or undefined
   */
  static getPlainParagraphs(data) {
    // Convert ProsemirrorNode to JSON if needed
    const jsonData = data instanceof _prosemirrorModel.Node ? data.toJSON() : data;
    const paragraphs = [];
    if (!jsonData.content) {
      return paragraphs;
    }
    for (const node of jsonData.content) {
      if (node.type === "paragraph" && (!node.content || !node.content.some(item => item.type !== "text" || item.marks && item.marks.length > 0))) {
        paragraphs.push(node);
      } else {
        return undefined;
      }
    }
    return paragraphs;
  }
}
exports.ProsemirrorHelper = ProsemirrorHelper;
_defineProperty(ProsemirrorHelper, "getLightboxNodes", doc => (0, _findChildren.findChildren)(doc, _Lightbox.isLightboxNode, true));