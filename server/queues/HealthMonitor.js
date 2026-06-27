"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _time = require("../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* oxlint-disable @typescript-eslint/no-misused-promises */
class HealthMonitor {
  /**
   * Starts a health monitor for the given queue. If the queue stops processing jobs then the
   * process is exit.
   *
   * @param queue The queue to monitor
   */
  static start(queue) {
    let lastActivityTime = Date.now();
    queue.on("active", () => {
      lastActivityTime = Date.now();
    });
    queue.on("completed", () => {
      lastActivityTime = Date.now();
    });
    queue.on("failed", () => {
      lastActivityTime = Date.now();
    });
    setInterval(async () => {
      const timeSinceActivity = Date.now() - lastActivityTime;

      // If there's been recent activity, the queue is healthy
      if (timeSinceActivity < 30 * _time.Second.ms) {
        return;
      }
      const waiting = await queue.getWaitingCount();
      if (waiting > 50) {
        _Logger.default.fatal("Queue has stopped processing jobs", new Error(`Jobs are waiting in the ${queue.name} queue`), {
          queue: queue.name,
          waiting
        });
      }
    }, 30 * _time.Second.ms);
  }
}
exports.default = HealthMonitor;