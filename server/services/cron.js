"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _time = require("../../shared/utils/time");
var _tasks = _interopRequireDefault(require("../queues/tasks"));
var _CronTask = require("../queues/tasks/base/CronTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function init() {
  async function run(schedule) {
    const partition = {
      partitionIndex: 0,
      partitionCount: 1
    };
    for (const name in _tasks.default) {
      const TaskClass = _tasks.default[name];
      if (!(TaskClass.prototype instanceof _CronTask.CronTask)) {
        continue;
      }

      // @ts-expect-error We won't instantiate an abstract class
      const taskInstance = new TaskClass();
      if (taskInstance.cron.interval === schedule) {
        await taskInstance.schedule({
          limit: 10000,
          partition
        });
      }
    }
  }
  setInterval(() => void run(_CronTask.TaskInterval.Day), _time.Day.ms);
  setInterval(() => void run(_CronTask.TaskInterval.Hour), _time.Hour.ms);

  // Just give everything time to startup before running the first time. Not
  // _technically_ required to function.
  setTimeout(() => {
    void run(_CronTask.TaskInterval.Day);
    void run(_CronTask.TaskInterval.Hour);
  }, 5 * _time.Second.ms);
}