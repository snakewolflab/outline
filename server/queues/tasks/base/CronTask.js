"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskInterval = exports.CronTask = void 0;
var _sequelize = require("sequelize");
var _time = require("../../../../shared/utils/time");
var _BaseTask = require("./BaseTask");
let TaskInterval = exports.TaskInterval = /*#__PURE__*/function (TaskInterval) {
  TaskInterval["Day"] = "daily";
  TaskInterval["Hour"] = "hourly";
  return TaskInterval;
}({});
/**
 * Stagger windows per interval to spread task start times and prevent
 * concurrent heavy database operations from saturating PostgreSQL.
 */
const staggerWindows = {
  [TaskInterval.Hour]: 10 * _time.Minute.ms,
  [TaskInterval.Day]: 30 * _time.Minute.ms
};

/**
 * Partition information for distributing work across multiple worker instances.
 */

/**
 * Properties for cron-scheduled tasks.
 */

class CronTask extends _BaseTask.BaseTask {
  /** The schedule configuration for this cron task */

  /**
   * Compute a deterministic delay for a task based on its name and interval.
   * Different tasks are likely to get different offsets within the stagger
   * window for their interval, reducing concurrent heavy database operations.
   *
   * @param taskName the name of the task class.
   * @param interval the task interval used to select the stagger window.
   * @returns a delay in milliseconds.
   */
  static getStaggerDelay(taskName, interval) {
    const windowMs = staggerWindows[interval];
    let hash = 0;
    for (let i = 0; i < taskName.length; i++) {
      hash = (hash << 5) - hash + taskName.charCodeAt(i) | 0;
    }
    return Math.abs(hash) % windowMs;
  }

  /**
   * Optimized partitioning method for UUID primary keys using range-based distribution.
   * Divides the UUID space into N equal ranges and assigns each partition a range.
   *
   * The UUID space (0x00000000-... to 0xffffffff-...) is divided into N equal ranges.
   * For example, with 3 partitions:
   * - Partition 0: '00000000-0000-4000-8000-000000000000' to '55555554-ffff-4fff-bfff-ffffffffffff'
   * - Partition 1: '55555555-0000-4000-8000-000000000000' to 'aaaaaaaa-ffff-4fff-bfff-ffffffffffff'
   * - Partition 2: 'aaaaaaab-0000-4000-8000-000000000000' to 'ffffffff-ffff-4fff-bfff-ffffffffffff'
   *
   * @param partitionInfo The partition information
   * @returns The start and end UUID bounds for the partition
   */
  getPartitionBounds(partitionInfo) {
    if (!partitionInfo) {
      return ["00000000-0000-4000-8000-000000000000", "ffffffff-ffff-4fff-bfff-ffffffffffff"];
    }
    const {
      partitionIndex,
      partitionCount
    } = partitionInfo;
    if (partitionCount <= 0 || partitionIndex < 0 || partitionIndex >= partitionCount) {
      throw new Error(`Invalid partition info: index ${partitionIndex}, count ${partitionCount}`);
    }

    // 2^32 total possible values for the first 32 bits (4.3 billion)
    const TOTAL_VALUES = 0x100000000;

    // The maximum possible integer value (0xFFFFFFFF)
    const MAX_VALUE = TOTAL_VALUES - 1;

    // Ensure even distribution of values by calculating exact range size
    const rangeSize = Math.floor(TOTAL_VALUES / partitionCount);
    const rangeStart = partitionIndex * rangeSize;
    let rangeEnd;
    if (partitionIndex === partitionCount - 1) {
      // The last partition takes any remainder and goes up to the max value
      rangeEnd = MAX_VALUE;
    } else {
      // The end is the start of the *next* partition minus 1
      rangeEnd = (partitionIndex + 1) * rangeSize - 1;
    }

    // Use Number.prototype.toString(16) and padStart(8, '0') for the 32-bit hex prefix
    const startHex = rangeStart.toString(16).padStart(8, "0");
    const endHex = rangeEnd.toString(16).padStart(8, "0");

    // Start: First 32 bits (prefix) followed by the lowest possible values for the rest
    // Ensures correct UUID v4 version (4xxx) and variant (8|9|a|bxxx) bits
    const startUuid = `${startHex}-0000-4000-8000-000000000000`;

    // End: First 32 bits (prefix) followed by the highest possible values for the rest
    // Ensures correct UUID v4 version (4xxx) and variant (8|9|a|bxxx) bits
    const endUuid = `${endHex}-ffff-4fff-bfff-ffffffffffff`;
    return [startUuid, endUuid];
  }

  /**
   * Optimized partitioning method for UUID primary keys using range-based distribution.
   * Divides the UUID space into N equal ranges and assigns each partition a range.
   *
   * @param idField The name of the UUID primary key field to partition on
   * @param partitionInfo The partition information
   * @returns A WHERE clause for partitioned queries
   *
   * @example
   * const where = {
   *   deletedAt: { [Op.lt]: someDate },
   *   ...this.getPartitionWhereClause("id", props.partition)
   * };
   */
  getPartitionWhereClause(idField, partitionInfo) {
    if (!partitionInfo) {
      return {};
    }
    const [startUuid, endUuid] = this.getPartitionBounds(partitionInfo);
    return {
      [idField]: {
        [_sequelize.Op.gte]: startUuid,
        [_sequelize.Op.lte]: endUuid
      }
    };
  }
}
exports.CronTask = CronTask;