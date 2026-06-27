"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DocumentInsightPeriod = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _Document = _interopRequireDefault(require("./Document"));
var _Team = _interopRequireDefault(require("./Team"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Changeset = require("./decorators/Changeset");
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let DocumentInsightPeriod = exports.DocumentInsightPeriod = /*#__PURE__*/function (DocumentInsightPeriod) {
  DocumentInsightPeriod["Day"] = "day";
  DocumentInsightPeriod["Week"] = "week";
  return DocumentInsightPeriod;
}({});
let DocumentInsight = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "document_insights",
  modelName: "documentInsight",
  indexes: [{
    fields: ["documentId", "date", "period"],
    unique: true
  }, {
    fields: ["teamId", "date"]
  }]
}), _dec2 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATEONLY), _dec3 = Reflect.metadata("design:type", String), _dec4 = (0, _sequelizeTypescript.Default)(DocumentInsightPeriod.Day), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM(...Object.values(DocumentInsightPeriod))), _dec6 = Reflect.metadata("design:type", typeof DocumentInsightPeriod === "undefined" ? Object : DocumentInsightPeriod), _dec7 = (0, _sequelizeTypescript.Default)(0), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec9 = Reflect.metadata("design:type", Number), _dec0 = (0, _sequelizeTypescript.Default)(0), _dec1 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec10 = Reflect.metadata("design:type", Number), _dec11 = (0, _sequelizeTypescript.Default)(0), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec13 = Reflect.metadata("design:type", Number), _dec14 = (0, _sequelizeTypescript.Default)(0), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec16 = Reflect.metadata("design:type", Number), _dec17 = (0, _sequelizeTypescript.Default)(0), _dec18 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec19 = Reflect.metadata("design:type", Number), _dec20 = (0, _sequelizeTypescript.Default)(0), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec22 = Reflect.metadata("design:type", Number), _dec23 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec24 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec25 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec27 = Reflect.metadata("design:type", String), _dec28 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec29 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec30 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec32 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class DocumentInsight extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "date", _descriptor, this);
    _initializerDefineProperty(this, "period", _descriptor2, this);
    _initializerDefineProperty(this, "viewCount", _descriptor3, this);
    _initializerDefineProperty(this, "viewerCount", _descriptor4, this);
    _initializerDefineProperty(this, "commentCount", _descriptor5, this);
    _initializerDefineProperty(this, "reactionCount", _descriptor6, this);
    _initializerDefineProperty(this, "revisionCount", _descriptor7, this);
    _initializerDefineProperty(this, "editorCount", _descriptor8, this);
    // associations
    _initializerDefineProperty(this, "document", _descriptor9, this);
    _initializerDefineProperty(this, "documentId", _descriptor0, this);
    _initializerDefineProperty(this, "team", _descriptor1, this);
    _initializerDefineProperty(this, "teamId", _descriptor10, this);
  }
  /**
   * Aggregate a time window of source activity (views, comments, reactions,
   * revisions) into document_insights rows for documents whose id falls in the
   * given UUID range. Upserts on the unique (documentId, date, period) index
   * so the operation is idempotent.
   *
   * @param options.periodStart UTC date string (YYYY-MM-DD) marking the start of the window.
   * @param options.intervalDays length of the window in days (1 for daily, 7 for weekly).
   * @param options.period the period type to write on each row.
   * @param options.startUuid inclusive lower bound of the document id partition.
   * @param options.endUuid inclusive upper bound of the document id partition.
   * @returns the number of rows upserted.
   */
  static async rollupPeriod(_ref) {
    let {
      periodStart,
      intervalDays,
      period,
      startUuid,
      endUuid
    } = _ref;
    const [{
      upserted
    }] = await this.sequelize.query(`
      WITH partitioned_documents AS (
        SELECT id, "teamId"
        FROM documents
        WHERE "deletedAt" IS NULL
          AND id >= :startUuid::uuid
          AND id <= :endUuid::uuid
      ),
      view_counts AS (
        SELECT
          e."documentId",
          COUNT(*) AS view_count,
          COUNT(DISTINCT e."userId") AS viewer_count
        FROM events e
        INNER JOIN partitioned_documents pd ON pd.id = e."documentId"
        WHERE e.name = 'views.create'
          AND e."createdAt" >= :periodStart::timestamp AT TIME ZONE 'UTC'
          AND e."createdAt" < (:periodStart::timestamp + (:intervalDays * INTERVAL '1 day')) AT TIME ZONE 'UTC'
        GROUP BY e."documentId"
      ),
      comment_counts AS (
        SELECT c."documentId", COUNT(*) AS comment_count
        FROM comments c
        INNER JOIN partitioned_documents pd ON pd.id = c."documentId"
        WHERE c."createdAt" >= :periodStart::timestamp AT TIME ZONE 'UTC'
          AND c."createdAt" < (:periodStart::timestamp + (:intervalDays * INTERVAL '1 day')) AT TIME ZONE 'UTC'
        GROUP BY c."documentId"
      ),
      reaction_counts AS (
        SELECT c."documentId", COUNT(rx.id) AS reaction_count
        FROM reactions rx
        INNER JOIN comments c ON c.id = rx."commentId"
        INNER JOIN partitioned_documents pd ON pd.id = c."documentId"
        WHERE rx."createdAt" >= :periodStart::timestamp AT TIME ZONE 'UTC'
          AND rx."createdAt" < (:periodStart::timestamp + (:intervalDays * INTERVAL '1 day')) AT TIME ZONE 'UTC'
        GROUP BY c."documentId"
      ),
      revision_counts AS (
        SELECT
          r."documentId",
          COUNT(*) AS revision_count,
          COUNT(DISTINCT r."userId") AS editor_count
        FROM revisions r
        INNER JOIN partitioned_documents pd ON pd.id = r."documentId"
        WHERE r."createdAt" >= :periodStart::timestamp AT TIME ZONE 'UTC'
          AND r."createdAt" < (:periodStart::timestamp + (:intervalDays * INTERVAL '1 day')) AT TIME ZONE 'UTC'
        GROUP BY r."documentId"
      ),
      active AS (
        SELECT "documentId" FROM view_counts
        UNION SELECT "documentId" FROM comment_counts
        UNION SELECT "documentId" FROM reaction_counts
        UNION SELECT "documentId" FROM revision_counts
      ),
      inserted AS (
        INSERT INTO document_insights (
          id, "documentId", "teamId", date, period,
          "viewCount", "viewerCount",
          "commentCount", "reactionCount",
          "revisionCount", "editorCount",
          "createdAt", "updatedAt"
        )
        SELECT
          uuid_generate_v4(),
          pd.id,
          pd."teamId",
          :periodStart::date,
          :period,
          COALESCE(v.view_count, 0),
          COALESCE(v.viewer_count, 0),
          COALESCE(c.comment_count, 0),
          COALESCE(rx.reaction_count, 0),
          COALESCE(r.revision_count, 0),
          COALESCE(r.editor_count, 0),
          NOW(), NOW()
        FROM active a
        INNER JOIN partitioned_documents pd ON pd.id = a."documentId"
        LEFT JOIN view_counts v ON v."documentId" = pd.id
        LEFT JOIN comment_counts c ON c."documentId" = pd.id
        LEFT JOIN reaction_counts rx ON rx."documentId" = pd.id
        LEFT JOIN revision_counts r ON r."documentId" = pd.id
        ON CONFLICT ("documentId", date, period) DO UPDATE SET
          "viewCount" = EXCLUDED."viewCount",
          "viewerCount" = EXCLUDED."viewerCount",
          "commentCount" = EXCLUDED."commentCount",
          "reactionCount" = EXCLUDED."reactionCount",
          "revisionCount" = EXCLUDED."revisionCount",
          "editorCount" = EXCLUDED."editorCount",
          "updatedAt" = NOW()
        RETURNING 1
      )
      SELECT COUNT(*)::text AS upserted FROM inserted
      `, {
      replacements: {
        periodStart,
        intervalDays,
        period,
        startUuid,
        endUuid
      },
      type: _sequelize.QueryTypes.SELECT
    });
    return parseInt(upserted, 10);
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "date", [_dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "period", [_dec4, _dec5, _Changeset.SkipChangeset, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "viewCount", [_dec7, _dec8, _Changeset.SkipChangeset, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "viewerCount", [_dec0, _dec1, _Changeset.SkipChangeset, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "commentCount", [_dec11, _dec12, _Changeset.SkipChangeset, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "reactionCount", [_dec14, _dec15, _Changeset.SkipChangeset, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "revisionCount", [_dec17, _dec18, _Changeset.SkipChangeset, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "editorCount", [_dec20, _dec21, _Changeset.SkipChangeset, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec25, _dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec30, _dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = DocumentInsight;