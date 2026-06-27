"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformListToMentions = transformListToMentions;
var _uuid = require("uuid");
var _isList = require("../queries/isList");
function transformListToMentions(listNode, schema, attrs) {
  const childNodes = [];
  listNode.forEach(node => {
    childNodes.push(transformListItemToMentions(node, schema, attrs));
  });
  return listNode.type.create(listNode.attrs, childNodes);
}
function transformListItemToMentions(listItemNode, schema, attrs) {
  const childNodes = [];
  listItemNode.forEach(node => {
    if (node.type.name === "paragraph") {
      const link = node.textContent;
      const mentionType = attrs[link];
      if (mentionType) {
        childNodes.push(node.type.create(node.attrs, schema.nodes.mention.create({
          id: (0, _uuid.v4)(),
          type: mentionType,
          label: link,
          href: link,
          modelId: (0, _uuid.v4)(),
          actorId: attrs.actorId
        })));
      } else {
        childNodes.push(node);
      }
    } else if ((0, _isList.isList)(node, schema)) {
      const subListNode = transformListToMentions(node, schema, attrs);
      childNodes.push(subListNode);
    }
  });
  return listItemNode.type.create(listItemNode.attrs, childNodes);
}