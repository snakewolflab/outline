"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.websocketQueue = exports.taskQueue = exports.processorEventQueue = exports.globalEventQueue = void 0;
var _queue = require("./queue");
var _time = require("../../shared/utils/time");
let cachedGlobalEventQueue;
const globalEventQueue = () => {
  if (!cachedGlobalEventQueue) {
    cachedGlobalEventQueue = (0, _queue.createQueue)("globalEvents", {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: _time.Second.ms
      }
    });
  }
  return cachedGlobalEventQueue;
};
exports.globalEventQueue = globalEventQueue;
let cachedProcessorEventQueue;
const processorEventQueue = () => {
  if (!cachedProcessorEventQueue) {
    cachedProcessorEventQueue = (0, _queue.createQueue)("processorEvents", {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 10 * _time.Second.ms
      }
    });
  }
  return cachedProcessorEventQueue;
};
exports.processorEventQueue = processorEventQueue;
let cachedWebsocketQueue;
const websocketQueue = () => {
  if (!cachedWebsocketQueue) {
    cachedWebsocketQueue = (0, _queue.createQueue)("websockets", {
      timeout: 10 * _time.Second.ms
    });
  }
  return cachedWebsocketQueue;
};
exports.websocketQueue = websocketQueue;
let cachedTaskQueue;
const taskQueue = () => {
  if (!cachedTaskQueue) {
    cachedTaskQueue = (0, _queue.createQueue)("tasks", {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 10 * _time.Second.ms
      }
    });
  }
  return cachedTaskQueue;
};
exports.taskQueue = taskQueue;