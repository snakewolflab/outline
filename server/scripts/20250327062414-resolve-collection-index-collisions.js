"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _sequelize = require("sequelize");
var _models = require("../models");
var _database = require("../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const limit = 100;
class CollectionIndexCollisionResolver {
  constructor(teamId) {
    _defineProperty(this, "teamId", void 0);
    _defineProperty(this, "currDuplicateIndex", null);
    _defineProperty(this, "currDuplicateGroup", []);
    _defineProperty(this, "resolvedCollisionsCount", 0);
    this.teamId = teamId;
  }
  async process() {
    await _database.sequelize.transaction(async transaction => {
      await this.processPage(0, transaction);
      // edge case of last batch
      await this.resolveDuplicates({
        transaction
      });
    });
  }
  async processPage(page, transaction) {
    console.log(`Resolve collection index collisions for team ${this.teamId}… page ${page}`);
    const collections = await _models.Collection.unscoped().findAll({
      where: {
        teamId: this.teamId
      },
      attributes: ["id", "index"],
      limit,
      offset: page * limit,
      order: [_sequelize.Sequelize.literal('"collection"."index" collate "C"'),
      // ensure duplicates are in sequential order
      ["updatedAt", "DESC"] // fallback as a tie breaker
      ],
      lock: _sequelize.Transaction.LOCK.UPDATE,
      transaction
    });
    if (!collections.length) {
      return;
    }
    let idx = 0;
    while (idx < collections.length) {
      const collection = collections[idx];
      if (collection.index === this.currDuplicateIndex) {
        // still in the same duplicate group.
        this.currDuplicateGroup.push(collection);
      } else {
        // current collection index is different from the previous one; resolve duplicates, if applicable.
        await this.resolveDuplicates({
          nextCollection: collection,
          transaction
        });
        // reset the duplicate index and group.
        this.currDuplicateIndex = collection.index;
        this.currDuplicateGroup = [collection];
      }
      idx++;
    }
    return collections.length === limit ? this.processPage(page + 1, transaction) : undefined;
  }
  async resolveDuplicates(_ref) {
    let {
      nextCollection,
      transaction
    } = _ref;
    if (this.currDuplicateGroup.length <= 1) {
      // no action needed when there aren't more than 1 item in a group.
      return;
    }
    let prevIndex = this.currDuplicateGroup[0].index;
    const endIndex = nextCollection?.index ?? null;

    // First collection in a duplicate group can retain its index.
    for (let idx = 1; idx < this.currDuplicateGroup.length; idx++) {
      const collection = this.currDuplicateGroup[idx];
      const newIndex = (0, _fractionalIndex.default)(prevIndex, endIndex);
      console.log(`New index for collection ${collection.id} = ${newIndex}`);
      collection.index = newIndex;
      await collection.save({
        silent: true,
        hooks: false,
        transaction
      });
      prevIndex = newIndex;
    }
    this.resolvedCollisionsCount += this.currDuplicateGroup.length - 1;
  }
}
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  await _models.Team.findAllInBatches({
    attributes: ["id"],
    batchLimit: 5
  }, async teams => {
    for (const team of teams) {
      const resolver = new CollectionIndexCollisionResolver(team.id);
      await resolver.process();
    }
  });
  if (exit) {
    process.exit(0);
  }
}

// In the test suite we import the script rather than run via node CLI
if (process.env.NODE_ENV !== "test") {
  void main(true);
}