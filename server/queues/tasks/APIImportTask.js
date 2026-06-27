"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _prosemirrorModel = require("prosemirror-model");
var _sequelize = require("sequelize");
var _nodeCrypto = require("node:crypto");
var _types = require("../../../shared/types");
var _error = require("../../../shared/utils/error");
var _context = require("../../context");
var _editor = require("../../editor");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _AttachmentHelper = _interopRequireDefault(require("../../models/helpers/AttachmentHelper"));
var _ProsemirrorHelper = require("../../models/helpers/ProsemirrorHelper");
var _database = require("../../storage/database");
var _ImportsProcessor = require("../processors/ImportsProcessor");
var _BaseTask = require("./base/BaseTask");
var _UploadAttachmentsForImportTask = _interopRequireDefault(require("./UploadAttachmentsForImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class APIImportTask extends _BaseTask.BaseTask {
  /**
   * Run the import task.
   *
   * @param importTaskId id of the import_task model.
   * @returns Promise that resolves once the task has completed.
   */
  async perform(_ref) {
    let {
      importTaskId
    } = _ref;
    let importTask = await _models.ImportTask.findByPk(importTaskId, {
      include: [{
        model: _models.Import,
        as: "import",
        required: true
      }]
    });

    // The import_task row may have been deleted (e.g. its Import was removed)
    // between the job being enqueued and the worker picking it up. Nothing to do.
    if (!importTask) {
      return;
    }

    // Don't process any further when the associated import is canceled by the user.
    if (importTask.import.state === _types.ImportState.Canceled) {
      importTask.state = _types.ImportTaskState.Canceled;
      await importTask.save();
      return;
    }
    try {
      switch (importTask.state) {
        case _types.ImportTaskState.Created:
          {
            importTask.state = _types.ImportTaskState.InProgress;
            importTask = await importTask.save();
            return await this.onProcess(importTask);
          }
        case _types.ImportTaskState.InProgress:
          return await this.onProcess(importTask);
        case _types.ImportTaskState.Completed:
          return await this.onCompletion(importTask);
        default:
      }
    } catch (err) {
      if (err instanceof Error) {
        importTask.error = (0, _compat.truncate)(err.message, {
          length: 255
        });
        await importTask.save();
      }
      throw err; // throw error for retry.
    }
  }

  /**
   * Handle failure when all attempts of APIImportTask has failed.
   *
   * @param importTaskId id of the import_task model.
   * @returns Promise that resolves once failure has been handled.
   */
  async onFailed(_ref2) {
    let {
      importTaskId
    } = _ref2;
    await _database.sequelize.transaction(async transaction => {
      const importTask = await _models.ImportTask.findByPk(importTaskId, {
        include: [{
          model: _models.Import,
          as: "import",
          required: true
        }],
        transaction,
        lock: _sequelize.Transaction.LOCK.UPDATE
      });
      if (!importTask) {
        return;
      }
      importTask.state = _types.ImportTaskState.Errored;
      await importTask.save({
        transaction
      });
      const associatedImport = importTask.import;
      associatedImport.error = importTask.error; // copy error from ImportTask that caused the failure.
      associatedImport.state = _types.ImportState.Errored;
      await associatedImport.saveWithCtx((0, _context.createContext)({
        user: associatedImport.createdBy,
        transaction
      }));
    });
  }

  /**
   * Creation flow for the task.
   * This fetches data from external source, stores the task output and creates subsequent import_task models.
   *
   * @param importTask import_task model to process.
   * @returns Promise that resolves once processing has completed.
   */
  async onProcess(importTask) {
    const {
      taskOutput,
      childTasksInput
    } = importTask.phase === _types.ImportTaskPhase.Bootstrap ? await this.processBootstrap(importTask) : await this.processPage(importTask);
    const taskOutputWithReplacements = this.shouldUploadAttachmentsPerPage() ? await Promise.all(taskOutput.map(async item => ({
      ...item,
      content: await this.uploadAttachments({
        doc: item.content,
        externalId: item.externalId,
        createdBy: importTask.import.createdBy
      })
    }))) : taskOutput;
    await _database.sequelize.transaction(async transaction => {
      await Promise.all((0, _compat.chunk)(childTasksInput, _ImportsProcessor.PagePerImportTask).map(async input => {
        await _models.ImportTask.create({
          state: _types.ImportTaskState.Created,
          phase: _types.ImportTaskPhase.Page,
          input: input,
          importId: importTask.importId
        }, {
          transaction
        });
      }));
      importTask.output = taskOutputWithReplacements;
      importTask.state = _types.ImportTaskState.Completed;
      importTask.error = null; // unset any error from previous attempts.
      await importTask.save({
        transaction
      });
      const associatedImport = importTask.import;
      associatedImport.documentCount += taskOutputWithReplacements.length;
      await associatedImport.saveWithCtx((0, _context.createContext)({
        user: associatedImport.createdBy,
        transaction
      }), undefined, {
        persist: false
      });
    });
    await this.scheduleNextTask(importTask);
  }

  /**
   * Completion flow for the task.
   * This determines if there are any more import_tasks to process (or) all tasks for the import have been processed, and schedules the next step.
   *
   * @param importTask import_task model to process.
   * @returns Promise that resolves once processing has completed.
   */
  async onCompletion(importTask) {
    const where = {
      state: _types.ImportTaskState.Created,
      importId: importTask.importId
    };
    const nextImportTask = await _models.ImportTask.findOne({
      where,
      order: [["createdAt", "ASC"]]
    });

    // Tasks available to process for this import.
    if (nextImportTask) {
      return await this.scheduleNextTask(nextImportTask);
    }

    // All tasks for this import have been processed. Run the post-completion
    // hook before flipping state so subclasses can perform work that must
    // happen before "imports.processed" downstream handlers fire.
    await this.onAllTasksCompleted(importTask);
    await _database.sequelize.transaction(async transaction => {
      const associatedImport = importTask.import;
      associatedImport.state = _types.ImportState.Processed;
      // Release any cross-phase scratch state — the import is done with it.
      associatedImport.scratch = null;
      await associatedImport.saveWithCtx((0, _context.createContext)({
        user: associatedImport.createdBy,
        transaction
      }), undefined, {
        name: "processed"
      });
    });
  }

  /**
   * Whether the base class should create Attachment rows and upload S3 blobs
   * per page during `onProcess`. Defaults to `true` for sources whose
   * attachments are addressable by per-task URLs (e.g. Notion). Sources where
   * attachments are shared across pages or live in a single archive may
   * override this and handle attachment persistence in `onAllTasksCompleted`.
   *
   * @returns true to enable the per-page attachment upload step.
   */
  shouldUploadAttachmentsPerPage() {
    return true;
  }

  /**
   * Hook invoked after the final import task has been processed but before the
   * associated `Import` state transitions to `Processed`. Subclasses can
   * override to perform cross-task finalization (e.g. uploading shared
   * attachments) that must happen before the persistence pass.
   *
   * @param lastImportTask The most recently completed ImportTask for the import.
   * @returns Promise that resolves when finalization is complete.
   */
  async onAllTasksCompleted(
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  lastImportTask) {
    return;
  }

  /**
   * Bootstrap phase. Runs once per import on a worker that owns the source
   * artifact (e.g. extracts a zip, walks the file tree, schedules child page
   * tasks). Subclasses without a bootstrap step leave this unimplemented; the
   * base only invokes it when an `ImportTask` is created with
   * `phase === ImportTaskPhase.Bootstrap`.
   *
   * @param importTask ImportTask model to process.
   * @returns Promise with output that resolves once processing has completed.
   */
  processBootstrap(
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  importTask) {
    throw new Error(`${this.constructor.name} does not implement processBootstrap()`);
  }

  /**
   * Page phase. Runs for every `ImportTask` row with
   * `phase === ImportTaskPhase.Page`, transforming a batch of source pages
   * into ProseMirror output and optionally cascading descendants as the next
   * wave of child tasks.
   *
   * @param importTask ImportTask model to process.
   * @returns Promise with output that resolves once processing has completed.
   */

  /**
   * Schedule the next `APIImportTask`.
   *
   * @param importTask ImportTask model associated with the `APIImportTask`.
   * @returns Promise that resolves when the task is scheduled.
   */

  /**
   * Upload attachments found in the external document.
   *
   * @param doc ProseMirrorDoc that represents collection (or) document content.
   * @param externalId id of the document in the external service.
   * @param createdBy user who created the import.
   * @returns Updated ProseMirrorDoc.
   */
  async uploadAttachments(_ref3) {
    let {
      doc,
      externalId,
      createdBy
    } = _ref3;
    const docNode = _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(doc);
    const nodes = [..._ProsemirrorHelper.ProsemirrorHelper.getImages(docNode), ..._ProsemirrorHelper.ProsemirrorHelper.getVideos(docNode), ..._ProsemirrorHelper.ProsemirrorHelper.getAttachments(docNode)];
    if (!nodes.length) {
      return doc;
    }
    const urlToAttachment = {};

    // perf: dedup url.
    const attachmentsData = (0, _compat.uniqBy)(nodes.map(node => {
      const url = String(node.type.name === "attachment" ? node.attrs.href : node.attrs.src);
      const name = String(node.type.name === "image" ? node.attrs.alt : node.attrs.title).trim();
      return {
        url,
        name: name.length !== 0 ? name : node.type.name
      };
    }), "url");
    await _database.sequelize.transaction(async transaction => {
      const dbPromises = attachmentsData.map(async item => {
        const modelId = (0, _nodeCrypto.randomUUID)();
        const acl = _AttachmentHelper.default.presetToAcl(_types.AttachmentPreset.DocumentAttachment);
        const key = _AttachmentHelper.default.getKey({
          id: modelId,
          name: item.name,
          userId: createdBy.id
        });
        const attachment = await _models.Attachment.create({
          id: modelId,
          key,
          acl,
          size: 0,
          expiresAt: _AttachmentHelper.default.presetToExpiry(_types.AttachmentPreset.DocumentAttachment),
          contentType: "application/octet-stream",
          documentId: externalId,
          teamId: createdBy.teamId,
          userId: createdBy.id
        }, {
          transaction
        });
        urlToAttachment[item.url] = attachment;
      });
      return await Promise.all(dbPromises);
    });
    try {
      const uploadItems = Object.entries(urlToAttachment).map(_ref4 => {
        let [url, attachment] = _ref4;
        return {
          attachmentId: attachment.id,
          url
        };
      });
      await new _UploadAttachmentsForImportTask.default().schedule(uploadItems);
    } catch (err) {
      // upload attachments failure is not critical enough to fail the whole import.
      _Logger.default.error(`upload attachment task failed for externalId ${externalId}`, (0, _error.toError)(err));
    }
    return this.replaceAttachmentUrls(docNode, urlToAttachment).toJSON();
  }

  /**
   * Replace remote url to internal redirect url for attachments.
   *
   * @param doc ProseMirror node that represents collection (or) document content.
   * @param urlToAttachment Map of remote url to attachment model.
   * @returns Updated Prosemirror node.
   */
  replaceAttachmentUrls(doc, urlToAttachment) {
    const attachmentTypes = ["attachment", "image", "video"];
    const transformAttachmentNode = node => {
      const json = node.toJSON();
      const attrs = json.attrs ?? {};
      if (node.type.name === "attachment") {
        const attachmentModel = urlToAttachment[attrs.href];
        // attachment node uses 'href' attribute.
        attrs.href = attachmentModel.redirectUrl;
        // attachment node can have id.
        attrs.id = attachmentModel.id;
      } else if (node.type.name === "image" || node.type.name === "video") {
        // image & video nodes use 'src' attribute.
        attrs.src = urlToAttachment[attrs.src].redirectUrl;
      }
      json.attrs = attrs;
      return _prosemirrorModel.Node.fromJSON(_editor.schema, json);
    };
    const transformFragment = fragment => {
      const nodes = [];
      fragment.forEach(node => {
        nodes.push(attachmentTypes.includes(node.type.name) ? transformAttachmentNode(node) : node.copy(transformFragment(node.content)));
      });
      return _prosemirrorModel.Fragment.fromArray(nodes);
    };
    return doc.copy(transformFragment(doc.content));
  }

  /**
   * Job options such as priority and retry strategy, as defined by Bull.
   */
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Normal,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60 * 1000
      }
    };
  }
}
exports.default = APIImportTask;