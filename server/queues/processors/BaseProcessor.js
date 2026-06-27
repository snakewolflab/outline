"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class BaseProcessor {
  /**
   * Handle an applicable event. Called once per queued job, with retries on
   * failure.
   *
   * @param event The event to process.
   * @returns A promise that resolves once the event has been processed.
   */

  /**
   * Handle failure when all attempts are exhausted for the processor.
   *
   * @param event processor event
   * @returns A promise that resolves once the processor handles the failure.
   */
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  onFailed(event) {
    return Promise.resolve();
  }
}
exports.default = BaseProcessor;
/**
 * The event names this processor handles. The global event queue only creates
 * a job for the processor when an event's name is listed here, or when it
 * contains the `"*"` wildcard to match every event.
 */
_defineProperty(BaseProcessor, "applicableEvents", []);
/**
 * Optional hook run in the global event queue before a job is created for this
 * processor. Implement it to cheaply opt out of events the processor will not
 * act on and avoid the cost of an empty job. When omitted, every applicable
 * event is queued.
 *
 * @param event The event about to be queued.
 * @returns true if a job should be queued for this processor.
 */
_defineProperty(BaseProcessor, "shouldQueue", void 0);