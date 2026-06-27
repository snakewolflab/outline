"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCode = isCode;
exports.isMermaid = isMermaid;
function isCode(node) {
  return node.type.name === "code_block" || node.type.name === "code_fence";
}

/**
 * Returns true if the node is a code block with Mermaid language (supports both "mermaid" and "mermaidjs").
 *
 * @param node The node to check.
 * @returns true if the node is a Mermaid code block.
 */
function isMermaid(node) {
  return isCode(node) && (node.attrs.language === "mermaid" || node.attrs.language === "mermaidjs");
}