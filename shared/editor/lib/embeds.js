"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMatchingEmbed = getMatchingEmbed;
exports.transformListToEmbeds = transformListToEmbeds;
var _isList = require("../queries/isList");
function getMatchingEmbed(embeds, href) {
  for (const e of embeds) {
    const matches = e.matcher(href);
    if (matches) {
      return {
        embed: e,
        matches
      };
    }
  }
  return undefined;
}
function transformListToEmbeds(listNode, schema) {
  const nodes = [];
  listNode.forEach(node => {
    nodes.push(...transformListItemToEmbeds(node, schema));
  });
  return nodes;
}
function transformListItemToEmbeds(listItemNode, schema) {
  const nodes = [];
  listItemNode.forEach(node => {
    if (node.type.name === "paragraph") {
      const url = node.textContent;
      nodes.push(schema.nodes.embed.create({
        href: url
      }));
    } else if ((0, _isList.isList)(node, schema)) {
      nodes.push(...transformListToEmbeds(node, schema));
    }
  });
  return nodes;
}