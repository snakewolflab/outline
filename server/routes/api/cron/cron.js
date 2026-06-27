"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _env = _interopRequireDefault(require("../../../env"));
var _errors = require("../../../errors");
var _Logger = _interopRequireDefault(require("../../../logging/Logger"));
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _tasks = _interopRequireDefault(require("../../../queues/tasks"));
var _CronTask = require("../../../queues/tasks/base/CronTask");
var _crypto = require("../../../utils/crypto");
var T = _interopRequireWildcard(require("./schema"));
var _time = require("../../../../shared/utils/time");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const receivedPeriods = new Set();
const cronHandler = async ctx => {
  const period = Object.values(_CronTask.TaskInterval).includes(ctx.params.period) ? ctx.params.period : _CronTask.TaskInterval.Day;
  const token = ctx.input.body.token ?? ctx.input.query.token;
  const limit = ctx.input.body.limit ?? ctx.input.query.limit;
  if (!(0, _crypto.safeEqual)(_env.default.UTILS_SECRET, token)) {
    throw (0, _errors.AuthenticationError)("Invalid secret token");
  }
  receivedPeriods.add(period);
  for (const name in _tasks.default) {
    const TaskClass = _tasks.default[name];
    if (!(TaskClass.prototype instanceof _CronTask.CronTask)) {
      continue;
    }

    // @ts-expect-error We won't instantiate an abstract class
    const taskInstance = new TaskClass();
    const cronConfig = taskInstance.cron;
    const partitionWindow = cronConfig.partitionWindow;
    const shouldSchedule = cronConfig.interval === period ||
    // Backwards compatibility for installations that have not set up
    // cron jobs periods other than daily.
    cronConfig.interval === _CronTask.TaskInterval.Hour && !receivedPeriods.has(_CronTask.TaskInterval.Hour) && period === _CronTask.TaskInterval.Day;
    if (shouldSchedule) {
      // Stagger different tasks so they don't all hit the database at once
      const taskDelay = _CronTask.CronTask.getStaggerDelay(name, cronConfig.interval);
      if (partitionWindow && partitionWindow > 0) {
        // Split the task into partitions to spread work across time window
        // by dividing the partitionWindow into minutes and scheduling a delayed
        // task for each minute. The taskDelay offsets the entire partition
        // window so different tasks don't overlap.
        const partitions = Math.ceil(partitionWindow / _time.Minute.ms);
        for (let i = 0; i < partitions; i++) {
          const delay = taskDelay + Math.floor(partitionWindow / partitions * i);
          const partition = {
            partitionIndex: i,
            partitionCount: partitions
          };
          _Logger.default.debug("task", `Scheduling partitioned task ${name} (partition ${i + 1}/${partitions}) with delay of ${delay / 1000}s`);
          await taskInstance.schedule({
            limit,
            partition
          }, {
            delay
          });
        }
      } else {
        await taskInstance.schedule({
          limit,
          partition: {
            partitionIndex: 0,
            partitionCount: 1
          }
        }, {
          delay: taskDelay
        });
      }
    }
  }
  ctx.body = {
    success: true
  };
};
router.get("cron.:period", (0, _validate.default)(T.CronSchema), cronHandler);
router.post("cron.:period", (0, _validate.default)(T.CronSchema), cronHandler);

// For backwards compatibility
router.get("utils.gc", (0, _validate.default)(T.CronSchema), cronHandler);
router.post("utils.gc", (0, _validate.default)(T.CronSchema), cronHandler);
var _default = exports.default = router;