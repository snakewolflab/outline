"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _promises = require("node:timers/promises");
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _error = require("../../../shared/utils/error");
var _time = require("../../../shared/utils/time");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _BaseTask = require("./base/BaseTask");
var _CronTask = require("./base/CronTask");
var _database = require("../../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Number of hours to add to age to smooth the decay curve,
 * preventing brand new content from having disproportionately
 * high scores compared to content just a few hours old.
 */
const TIME_OFFSET_HOURS = 2;

/**
 * Weight multipliers for different activity types relative to base score
 */
const ACTIVITY_WEIGHTS = {
  revision: 1.0,
  comment: 1.2,
  reaction: 0.8,
  view: 0.5
};

/**
 * Batch size for processing updates - kept small to minimize lock contention
 */
const BATCH_SIZE = 100;

/**
 * Delay between batches in milliseconds to reduce sustained database pressure
 */
const INTER_BATCH_DELAY_MS = 500;

/**
 * Base name for the working table used to track documents to process
 */
const WORKING_TABLE_PREFIX = "popularity_score_working";
class UpdateDocumentsPopularityScoreTask extends _CronTask.CronTask {
  constructor() {
    super(...arguments);
    /**
     * Unique table name for this task run to prevent conflicts with concurrent runs
     */
    _defineProperty(this, "workingTable", "");
  }
  async perform(_ref) {
    let {
      partition
    } = _ref;
    // Only run every X hours, skip other hours
    const currentHour = new Date().getHours();
    if (currentHour % _env.default.POPULARITY_UPDATE_INTERVAL_HOURS !== 0) {
      _Logger.default.debug("task", `Skipping popularity score update, will run at next ${_env.default.POPULARITY_UPDATE_INTERVAL_HOURS}-hour interval (current hour: ${currentHour})`);
      return;
    }
    const now = new Date();
    // Use UTC day boundaries to match how document_insights.date is written by
    // RollupDocumentInsightsTask (which derives dates via toISOString). Local
    // timezone could shift the window by a day in some deployments.
    const today = now.toISOString().slice(0, 10);
    const thresholdDate = (0, _dateFns.subDays)(now, _env.default.POPULARITY_ACTIVITY_THRESHOLD_WEEKS * 7).toISOString().slice(0, 10);

    // Generate unique table name for this run to prevent conflicts
    const dateStr = now.toISOString().slice(0, 19).replace(/[-:T]/g, "");
    const uniqueId = _nodeCrypto.default.randomBytes(4).toString("hex");
    this.workingTable = `${WORKING_TABLE_PREFIX}_${dateStr}_${uniqueId}`;
    try {
      // Clean up any stale working tables left behind by previous crashed runs
      await this.cleanupStaleWorkingTables();

      // Setup: Create working table and populate with active document IDs
      await this.setupWorkingTable(thresholdDate, today, partition);
      const activeCount = await this.getWorkingTableCount();
      if (activeCount === 0) {
        _Logger.default.info("task", "No documents with recent activity found");
        return;
      }
      _Logger.default.info("task", `Found ${activeCount} documents with recent activity`);

      // Process documents in independent batches
      let totalUpdated = 0;
      let totalErrors = 0;
      let batchNumber = 0;
      while (true) {
        const remaining = await this.getWorkingTableCount();
        if (remaining === 0) {
          break;
        }
        batchNumber++;
        try {
          const updated = await this.processBatch(thresholdDate, today);
          totalUpdated += updated;
          _Logger.default.debug("task", `Batch ${batchNumber}: updated ${updated} documents, ${remaining - updated} remaining`);

          // Add delay between batches to reduce sustained pressure on the database
          if (remaining - updated > 0) {
            await (0, _promises.setTimeout)(INTER_BATCH_DELAY_MS);
          }
        } catch (error) {
          totalErrors++;
          _Logger.default.error(`Batch ${batchNumber} failed after retries`, (0, _error.toError)(error));

          // Remove failed batch from working table to prevent infinite loop
          await this.skipCurrentBatch();
        }
      }
      _Logger.default.info("task", `Completed updating popularity scores: ${totalUpdated} documents updated, ${totalErrors} batch errors`);
    } catch (error) {
      _Logger.default.error("Failed to update document popularity scores", (0, _error.toError)(error));
      throw error;
    } finally {
      // Always clean up the working table
      await this.cleanupWorkingTable();
    }
  }

  /**
   * Creates an unlogged working table and populates it with document IDs
   * that have recent activity. Unlogged tables are faster because they
   * skip WAL logging, and data loss on crash is acceptable here.
   */
  async setupWorkingTable(thresholdDate, today, partition) {
    // Drop any existing table first to avoid type conflicts from previous crashed runs
    await _database.sequelize.query(`DROP TABLE IF EXISTS ${this.workingTable} CASCADE`);

    // Create unlogged table - faster than regular tables as it skips WAL logging
    await _database.sequelize.query(`
      CREATE UNLOGGED TABLE ${this.workingTable} (
        "documentId" UUID PRIMARY KEY,
        processed BOOLEAN DEFAULT FALSE
      )
    `);
    const [startUuid, endUuid] = this.getPartitionBounds(partition);

    // Populate with documents that have recent activity OR a current non-zero
    // score (so dormant docs decay back to zero once activity falls out of the
    // window). Must be valid: published and not deleted. Process in chunks to
    // avoid long-running queries. Read from replica to avoid excessive locking.
    let lastId = startUuid;
    let insertedCount = 0;
    const chunkSize = 1000;
    while (true) {
      // Step 1: Read document IDs from readonly replica to avoid locking
      const documentIds = await _database.sequelizeReadOnly.query(`
        SELECT d.id
        FROM documents d
        WHERE d."publishedAt" IS NOT NULL
          AND d."deletedAt" IS NULL
          ${lastId ? insertedCount === 0 ? "AND d.id >= :lastId" : "AND d.id > :lastId" : ""}
          ${endUuid ? "AND d.id <= :endUuid" : ""}
          AND (
            d."popularityScore" > 0
            OR EXISTS (
              SELECT 1 FROM document_insights di
              WHERE di."documentId" = d.id
                AND di.date >= :thresholdDate::date
                AND di.date <= :today::date
            )
          )
        ORDER BY d.id
        LIMIT :limit
        `, {
        replacements: {
          thresholdDate,
          today,
          lastId,
          endUuid,
          limit: chunkSize
        },
        type: _sequelize.QueryTypes.SELECT
      });
      if (documentIds.length === 0) {
        break;
      }

      // Step 2: Insert the IDs into the working table on primary
      const ids = documentIds.map(d => d.id);
      const result = await _database.sequelize.query(`
        INSERT INTO ${this.workingTable} ("documentId")
        SELECT * FROM unnest(ARRAY[:ids]::uuid[])
        ON CONFLICT ("documentId") DO NOTHING
        RETURNING "documentId"
        `, {
        replacements: {
          ids
        },
        type: _sequelize.QueryTypes.SELECT
      });
      insertedCount += result.length;
      lastId = documentIds[documentIds.length - 1].id;
      if (documentIds.length < chunkSize) {
        break;
      }
    }
    _Logger.default.debug("task", `Populated working table with ${insertedCount} documents in ${Math.ceil(insertedCount / chunkSize)} chunks`);

    // Create index on processed column for efficient batch selection
    await _database.sequelize.query(`
      CREATE INDEX ON ${this.workingTable} (processed) WHERE NOT processed
    `);
  }

  /**
   * Returns count of unprocessed documents in working table
   */
  async getWorkingTableCount() {
    const [result] = await _database.sequelize.query(`SELECT COUNT(*) as count FROM ${this.workingTable} WHERE NOT processed`, {
      type: _sequelize.QueryTypes.SELECT
    });
    return parseInt(result.count, 10);
  }

  /**
   * Processes a batch of documents with retry logic.
   */
  async processBatch(thresholdDate, today) {
    // Step 1: Get batch of document IDs to process
    const batch = await _database.sequelize.query(`
        SELECT "documentId" FROM ${this.workingTable}
        WHERE NOT processed
        ORDER BY "documentId"
        LIMIT :limit
        `, {
      replacements: {
        limit: BATCH_SIZE
      },
      type: _sequelize.QueryTypes.SELECT
    });
    if (batch.length === 0) {
      return 0;
    }
    const documentIds = batch.map(b => b.documentId);

    // Step 2: Calculate scores outside of a transaction
    const scores = await this.calculateScoresForDocuments(documentIds, thresholdDate, today);

    // Step 3: Update document scores
    await this.updateDocumentScores(scores);

    // Step 4: Mark batch as processed
    await this.markBatchProcessed(documentIds);
    return documentIds.length;
  }

  /**
   * Calculates popularity scores for a set of documents by summing weighted,
   * time-decayed daily activity counts from the document_insights rollup.
   * This is a read-only operation that doesn't require locks.
   */
  async calculateScoresForDocuments(documentIds, thresholdDate, today) {
    const results = await _database.sequelizeReadOnly.query(`
      WITH batch_docs AS (
        SELECT * FROM unnest(ARRAY[:documentIds]::uuid[]) AS t(id)
      )
      SELECT
        bd.id AS "documentId",
        COALESCE(SUM(
          (di."revisionCount" * :revisionWeight
            + di."commentCount" * :commentWeight
            + di."reactionCount" * :reactionWeight
            + di."viewCount" * :viewWeight)
          / POWER(
            GREATEST(
              (:today::date - di.date) * 24 + :timeOffset,
              0.1
            ),
            :gravity
          )
        ), 0) AS total_score
      FROM batch_docs bd
      LEFT JOIN document_insights di
        ON di."documentId" = bd.id
        AND di.date >= :thresholdDate::date
        AND di.date <= :today::date
      GROUP BY bd.id
      `, {
      replacements: {
        documentIds,
        thresholdDate,
        today,
        gravity: _env.default.POPULARITY_GRAVITY,
        timeOffset: TIME_OFFSET_HOURS,
        revisionWeight: ACTIVITY_WEIGHTS.revision,
        commentWeight: ACTIVITY_WEIGHTS.comment,
        reactionWeight: ACTIVITY_WEIGHTS.reaction,
        viewWeight: ACTIVITY_WEIGHTS.view
      },
      type: _sequelize.QueryTypes.SELECT
    });
    return results.map(r => ({
      documentId: r.documentId,
      score: parseFloat(r.total_score) || 0
    }));
  }

  /**
   * Updates document scores in a minimal transaction.
   * Uses individual updates to minimize lock duration and contention.
   */
  async updateDocumentScores(scores) {
    if (scores.length === 0) {
      return;
    }

    // Update documents in a single batch to improve performance and reduce round-trips.
    // We use unnest with multiple arrays to ensure the IDs and scores stay aligned.
    // We also use SKIP LOCKED to avoid waiting on locked rows from other concurrent tasks.
    await _database.sequelize.query(`
      WITH lockable AS (
        SELECT id FROM documents WHERE id = ANY(ARRAY[:ids]::uuid[]) FOR UPDATE SKIP LOCKED
      )
      UPDATE documents AS d
      SET "popularityScore" = s.score
      FROM (
        SELECT * FROM unnest(ARRAY[:ids]::uuid[], ARRAY[:scores]::double precision[]) AS s(id, score)
      ) AS s
      WHERE d.id = s.id
      AND d.id IN (SELECT id FROM lockable)
      `, {
      replacements: {
        ids: scores.map(s => s.documentId),
        scores: scores.map(s => s.score)
      }
    });
  }

  /**
   * Marks documents as processed in the working table
   */
  async markBatchProcessed(documentIds) {
    await _database.sequelize.query(`
      UPDATE ${this.workingTable}
      SET processed = TRUE
      WHERE "documentId" = ANY(ARRAY[:documentIds]::uuid[])
      `, {
      replacements: {
        documentIds
      }
    });
  }

  /**
   * Marks current batch as processed without updating scores.
   * Used when a batch fails repeatedly to prevent infinite loops.
   */
  async skipCurrentBatch() {
    await _database.sequelize.query(`
      UPDATE ${this.workingTable}
      SET processed = TRUE
      WHERE "documentId" IN (
        SELECT "documentId" FROM ${this.workingTable}
        WHERE NOT processed
        ORDER BY "documentId"
        LIMIT :limit
      )
      `, {
      replacements: {
        limit: BATCH_SIZE
      }
    });
  }

  /**
   * Drops any stale working tables from previous dates that were left behind
   * by runs interrupted before cleanup could occur (e.g. worker killed mid-run).
   * Only removes tables from before the current date to avoid race conditions
   * with concurrent runs.
   */
  async cleanupStaleWorkingTables() {
    try {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const tables = await _database.sequelize.query(`SELECT tablename FROM pg_tables
         WHERE schemaname = 'public'
           AND tablename LIKE :prefix`, {
        replacements: {
          prefix: `${WORKING_TABLE_PREFIX}%`
        },
        type: _sequelize.QueryTypes.SELECT
      });
      const prefixLen = WORKING_TABLE_PREFIX.length + 1; // +1 for underscore

      for (const {
        tablename
      } of tables) {
        const dateStr = tablename.slice(prefixLen, prefixLen + 8);
        if (dateStr < todayStr) {
          _Logger.default.info("task", `Dropping stale working table: ${tablename}`);
          await _database.sequelize.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
        }
      }
    } catch (error) {
      _Logger.default.warn("Failed to clean up stale working tables", {
        error
      });
    }
  }

  /**
   * Removes the working table
   */
  async cleanupWorkingTable() {
    try {
      await _database.sequelize.query(`DROP TABLE IF EXISTS ${this.workingTable} CASCADE`);
    } catch (error) {
      _Logger.default.warn("Failed to clean up working table", {
        error
      });
    }
  }
  get cron() {
    return {
      interval: _CronTask.TaskInterval.Hour,
      partitionWindow: 30 * _time.Minute.ms
    };
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = UpdateDocumentsPopularityScoreTask;