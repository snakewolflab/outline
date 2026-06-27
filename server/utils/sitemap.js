"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigationNodeToSitemap = navigationNodeToSitemap;
var _compat = require("es-toolkit/compat");
/**
 * Converts a navigation tree to a sitemap XML string, by traversing the nodes.
 *
 * @param tree The navigation tree to convert.
 * @param baseUrl The base URL to prepend to each node's URL.
 * @returns The sitemap XML string.
 */
function navigationNodeToSitemap(tree, baseUrl) {
  const urls = [];
  function collectUrls(node, urls) {
    urls.push(`${baseUrl}${node.url}`);
    if (node.children) {
      node.children.forEach(child => collectUrls(child, urls));
    }
  }
  if (tree) {
    collectUrls(tree, urls);
  }

  // Build XML
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${(0, _compat.escape)(url)}</loc><changefreq>weekly</changefreq></url>`).join("\n")}\n</urlset>`;
}