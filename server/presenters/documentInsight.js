"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentDocumentInsight;
function presentDocumentInsight(insight) {
  return {
    date: insight.date,
    period: insight.period,
    viewCount: insight.viewCount,
    viewerCount: insight.viewerCount,
    commentCount: insight.commentCount,
    reactionCount: insight.reactionCount,
    revisionCount: insight.revisionCount,
    editorCount: insight.editorCount
  };
}