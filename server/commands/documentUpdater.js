"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentUpdater;
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _TextHelper = require("../models/helpers/TextHelper");
/**
 * This command updates document properties. To update collaborative text state
 * use documentCollaborativeUpdater.
 *
 * @param Props The properties of the document to update
 * @returns Document The updated document
 */
async function documentUpdater(ctx, _ref) {
  let {
    document,
    title,
    icon,
    color,
    text,
    editorVersion,
    templateId,
    fullWidth,
    insightsEnabled,
    editMode,
    findText,
    publish,
    collectionId,
    done
  } = _ref;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const cId = collectionId || document.collectionId;
  if (title !== undefined) {
    document.title = title.trim();
  }
  if (icon !== undefined) {
    document.icon = icon;
  }
  if (color !== undefined) {
    document.color = color;
  }
  if (editorVersion) {
    document.editorVersion = editorVersion;
  }
  if (templateId) {
    document.templateId = templateId;
  }
  if (fullWidth !== undefined) {
    document.fullWidth = fullWidth;
  }
  if (insightsEnabled !== undefined) {
    document.insightsEnabled = insightsEnabled;
  }
  if (text !== undefined) {
    document = _DocumentHelper.DocumentHelper.applyMarkdownToDocument(document, await _TextHelper.TextHelper.replaceImagesWithAttachments(ctx, text, user, {
      base64Only: true
    }), editMode, findText);
  }
  const changed = document.changed();
  const eventData = done !== undefined ? {
    done
  } : undefined;
  const event = {
    name: "documents.update",
    documentId: document.id,
    collectionId: cId,
    data: eventData
  };
  if (publish && cId) {
    if (!document.collectionId) {
      document.collectionId = cId;
    }
    await document.publish(ctx, {
      collectionId: cId,
      data: eventData
    });
  } else if (changed) {
    document.lastModifiedById = user.id;
    document.updatedBy = user;
    await document.saveWithCtx(ctx, undefined, {
      data: eventData
    });
  } else if (done) {
    await _models.Event.schedule({
      ...event,
      actorId: user.id,
      teamId: document.teamId
    });
  }
  return await _models.Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
}