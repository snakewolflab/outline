"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotionConverter = void 0;
var _nodeCrypto = require("node:crypto");
var _compat = require("es-toolkit/compat");
var _Notice = require("../../../../shared/editor/nodes/Notice");
var _types = require("../../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/** Convert Notion blocks to Outline data. */
class NotionConverter {
  static page(item) {
    return {
      type: "doc",
      content: this.mapChildren(item)
    };
  }
  static mapChildren(item) {
    const mapChild = child => {
      if (child.type === "child_page") {
        return this.child_page(child);
      }
      if (child.type === "child_database") {
        return this.child_database(child);
      }

      // @ts-expect-error Not all blocks have an interface
      if (this[child.type]) {
        // @ts-expect-error Not all blocks have an interface
        const response = this[child.type](child);

        // @ts-expect-error Not all blocks have an interface
        const canToggle = child[child.type].is_toggleable === true;
        if (canToggle) {
          return {
            type: "container_toggle",
            attrs: {
              id: (0, _nodeCrypto.randomUUID)()
            },
            content: [response, ...this.mapChildren(child)]
          };
        }
        if (response && this.nodesWithoutBlockChildren.includes(response.type) && "children" in child) {
          return [response, ...this.mapChildren(child)];
        }
        return response;
      }
      _Logger.default.warn("Encountered unknown Notion block", child);
      return undefined;
    };
    let wrappingList;
    const children = [];
    if (!item.children) {
      return [];
    }
    for (const child of item.children) {
      const mapped = mapChild(child);
      if (!mapped) {
        continue;
      }

      // Ensure lists are wrapped correctly – we require a wrapping element
      // whereas Notion does not
      // TODO: Handle mixed list
      if (child.type === "numbered_list_item") {
        if (!wrappingList) {
          wrappingList = {
            type: "ordered_list",
            content: []
          };
        }
        wrappingList.content.push(...((0, _compat.isArray)(mapped) ? mapped : [mapped]));
        continue;
      }
      if (child.type === "bulleted_list_item") {
        if (!wrappingList) {
          wrappingList = {
            type: "bullet_list",
            content: []
          };
        }
        wrappingList.content.push(...((0, _compat.isArray)(mapped) ? mapped : [mapped]));
        continue;
      }
      if (child.type === "to_do") {
        if (!wrappingList) {
          wrappingList = {
            type: "checkbox_list",
            content: []
          };
        }
        wrappingList.content.push(...((0, _compat.isArray)(mapped) ? mapped : [mapped]));
        continue;
      }
      if (wrappingList) {
        children.push(wrappingList);
        wrappingList = undefined;
      }
      children.push(...((0, _compat.isArray)(mapped) ? mapped : [mapped]));
    }
    if (wrappingList) {
      children.push(wrappingList);
    }
    return children;
  }
  static callout(item) {
    const colorToNoticeType = {
      default_background: _Notice.NoticeTypes.Info,
      blue_background: _Notice.NoticeTypes.Info,
      purple_background: _Notice.NoticeTypes.Info,
      green_background: _Notice.NoticeTypes.Success,
      orange_background: _Notice.NoticeTypes.Tip,
      yellow_background: _Notice.NoticeTypes.Tip,
      pink_background: _Notice.NoticeTypes.Warning,
      red_background: _Notice.NoticeTypes.Warning
    };
    return {
      type: "container_notice",
      attrs: {
        style: colorToNoticeType[item.callout.color] ?? _Notice.NoticeTypes.Info
      },
      content: [{
        type: "paragraph",
        content: item.callout.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static column_list(item) {
    return this.mapChildren(item);
  }
  static column(item) {
    return this.mapChildren(item);
  }
  static bookmark(item) {
    const caption = item.bookmark.caption.map(this.rich_text_to_plaintext).join("");
    const text = caption || item.bookmark.url;
    return text ? {
      type: "paragraph",
      content: [{
        type: "text",
        text,
        marks: [{
          type: "link",
          attrs: {
            href: item.bookmark.url,
            title: null
          }
        }]
      }]
    } : undefined;
  }
  static breadcrumb(_) {
    return undefined;
  }
  static bulleted_list_item(item) {
    return {
      type: "list_item",
      content: [{
        type: "paragraph",
        content: item.bulleted_list_item.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static code(item) {
    const text = item.code.rich_text.map(this.rich_text_to_plaintext).join("");
    return {
      type: "code_fence",
      attrs: {
        language: item.code.language
      },
      content: text ? [{
        type: "text",
        text
      }] : undefined
    };
  }
  static numbered_list_item(item) {
    return {
      type: "list_item",
      content: [{
        type: "paragraph",
        content: item.numbered_list_item.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static divider(_) {
    return {
      type: "hr"
    };
  }
  static equation(item) {
    return {
      type: "math_block",
      content: item.equation.expression ? [{
        type: "text",
        text: item.equation.expression
      }] : undefined
    };
  }
  static embed(item) {
    return {
      type: "embed",
      attrs: {
        href: item.embed.url
      }
    };
  }
  static file(item) {
    return {
      type: "attachment",
      attrs: {
        href: "file" in item.file ? item.file.file.url : item.file.external.url,
        title: item.file.name
      }
    };
  }
  static pdf(item) {
    return {
      type: "attachment",
      attrs: {
        href: "file" in item.pdf ? item.pdf.file.url : item.pdf.external.url,
        title: item.pdf.caption.map(this.rich_text_to_plaintext).join("")
      }
    };
  }
  static heading_1(item) {
    return {
      type: "heading",
      attrs: {
        level: 1
      },
      content: item.heading_1.rich_text.map(this.rich_text).filter(Boolean)
    };
  }
  static heading_2(item) {
    return {
      type: "heading",
      attrs: {
        level: 2
      },
      content: item.heading_2.rich_text.map(this.rich_text).filter(Boolean)
    };
  }
  static heading_3(item) {
    return {
      type: "heading",
      attrs: {
        level: 3
      },
      content: item.heading_3.rich_text.map(this.rich_text).filter(Boolean)
    };
  }
  static image(item) {
    return {
      type: "paragraph",
      content: [{
        type: "image",
        attrs: {
          src: "file" in item.image ? item.image.file.url : item.image.external.url,
          alt: item.image.caption.map(this.rich_text_to_plaintext).join("")
        }
      }]
    };
  }
  static link_preview(item) {
    return item.link_preview.url ? {
      type: "paragraph",
      content: [{
        type: "text",
        text: item.link_preview.url,
        marks: [{
          type: "link",
          attrs: {
            href: item.link_preview.url
          }
        }]
      }]
    } : undefined;
  }
  static child_page(item) {
    return {
      type: "paragraph",
      content: [{
        type: "mention",
        attrs: {
          type: _types.MentionType.Document,
          modelId: item.id,
          label: item.child_page.title
        }
      }]
    };
  }
  static child_database(item) {
    return {
      type: "paragraph",
      content: [{
        type: "mention",
        attrs: {
          type: _types.MentionType.Document,
          modelId: item.id,
          label: item.child_database.title
        }
      }]
    };
  }
  static link_to_page(item) {
    if (item.link_to_page.type !== "page_id") {
      return undefined;
    }
    return {
      type: "mention",
      attrs: {
        modelId: item.link_to_page.page_id,
        type: _types.MentionType.Document,
        label: "Page"
      }
    };
  }
  static paragraph(item) {
    return {
      type: "paragraph",
      content: item.paragraph.rich_text.map(this.rich_text).filter(Boolean)
    };
  }
  static quote(item) {
    return {
      type: "blockquote",
      content: [{
        type: "paragraph",
        content: item.quote.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static synced_block(item) {
    return this.mapChildren(item);
  }
  static table(item) {
    // A table with no rows is invalid content, skip it entirely.
    if (!item.children?.length) {
      return undefined;
    }
    return {
      type: "table",
      content: item.children.map((tr, y) => ({
        type: "tr",
        content: tr.table_row.cells.map((td, x) => ({
          type: item.table.has_row_header && y === 0 || item.table.has_column_header && x === 0 ? "th" : "td",
          content: [{
            type: "paragraph",
            content: td.map(this.rich_text).filter(Boolean)
          }]
        }))
      }))
    };
  }
  static table_of_contents(_) {
    return undefined;
  }
  static toggle(item) {
    return {
      type: "container_toggle",
      attrs: {
        id: (0, _nodeCrypto.randomUUID)()
      },
      content: [{
        type: "paragraph",
        content: item.toggle.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static to_do(item) {
    return {
      type: "checkbox_item",
      attrs: {
        checked: item.to_do.checked
      },
      content: [{
        type: "paragraph",
        content: item.to_do.rich_text.map(this.rich_text).filter(Boolean)
      }, ...this.mapChildren(item)]
    };
  }
  static video(item) {
    if (item.video.type === "file") {
      return {
        type: "video",
        attrs: {
          src: item.video.file.url,
          title: item.video.caption.map(this.rich_text_to_plaintext).join("")
        }
      };
    }
    return {
      type: "embed",
      attrs: {
        href: item.video.external.url
      }
    };
  }
}
exports.NotionConverter = NotionConverter;
/**
 * Nodes which cannot contain block children in Outline, their children
 * will be flattened into the parent.
 */
_defineProperty(NotionConverter, "nodesWithoutBlockChildren", ["paragraph"]);
_defineProperty(NotionConverter, "rich_text", item => {
  const annotationToMark = {
    bold: "strong",
    code: "code_inline",
    italic: "em",
    underline: "underline",
    strikethrough: "strikethrough",
    color: "highlight"
  };
  const mapAttrs = () => Object.entries(item.annotations).filter(_ref => {
    let [key] = _ref;
    return key !== "color";
  }).filter(_ref2 => {
    let [, enabled] = _ref2;
    return enabled;
  }).map(_ref3 => {
    let [key] = _ref3;
    return {
      type: annotationToMark[key]
    };
  });
  if (item.type === "mention") {
    if (item.mention.type === "page") {
      return {
        type: "mention",
        attrs: {
          type: _types.MentionType.Document,
          label: item.plain_text,
          modelId: item.mention.page.id
        }
      };
    }
    if (item.mention.type === "link_mention") {
      const text = item.plain_text || item.mention.link_mention.href;
      return text ? {
        type: "text",
        text,
        marks: [{
          type: "link",
          attrs: {
            href: item.mention.link_mention.href
          }
        }]
      } : undefined;
    }
    if (item.mention.type === "link_preview") {
      const text = item.plain_text || item.mention.link_preview.url;
      return text ? {
        type: "text",
        text: item.plain_text || item.mention.link_preview.url,
        marks: [{
          type: "link",
          attrs: {
            href: item.mention.link_preview.url
          }
        }]
      } : undefined;
    }
    if (item.plain_text) {
      return {
        type: "text",
        text: item.plain_text
      };
    }
    return undefined;
  }
  if (item.type === "equation") {
    return item.equation.expression ? {
      type: "math_inline",
      content: [{
        type: "text",
        text: item.equation.expression
      }]
    } : undefined;
  }
  if (item.text.content) {
    return {
      type: "text",
      text: item.text.content,
      marks: [...mapAttrs(), ...(item.text.link ? [{
        type: "link",
        attrs: {
          href: item.text.link.url
        }
      }] : [])].filter(Boolean)
    };
  }
  return undefined;
});
_defineProperty(NotionConverter, "rich_text_to_plaintext", item => item.plain_text);