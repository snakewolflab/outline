"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPriority = exports.BaseTask = void 0;
var _ = require("../../");
let TaskPriority = exports.TaskPriority = /*#__PURE__*/function (TaskPriority) {
  TaskPriority[TaskPriority["Background"] = 40] = "Background";
  TaskPriority[TaskPriority["Low"] = 30] = "Low";
  TaskPriority[TaskPriority["Normal"] = 20] = "Normal";
  TaskPriority[TaskPriority["High"] = 10] = "High";
  return TaskPriority;
}({});
class BaseTask {
  /**
   * Schedule this task type to be processed asynchronously by a worker.
   *
   * @param props Properties to be used by the task
   * @param options Job options such as priority and retry strategy, as defined by Bull.
   * @returns A promise that resolves once the job is placed on the task queue
   */
  schedule(props, options) {
    return (0, _.taskQueue)().add({
      name: this.constructor.name,
      props
    }, {
      ...options,
      ...this.options
    });
  }

  /**
   * Execute the task.
   *
   * @param props Properties to be used by the task
   * @returns A promise that resolves once the task has completed.
   */

  /**
   * Handle failure when all attempts are exhausted for the task.
   *
   * @param props Properties to be used by the task
   * @returns A promise that resolves once the task handles the failure.
   */
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  onFailed(props) {
    return Promise.resolve();
  }

  /**
   * Job options such as priority and retry strategy.
   */
  get options() {
    return {
      priority: TaskPriority.Normal,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 60 * 1000
      }
    };
  }
}
exports.BaseTask = BaseTask;