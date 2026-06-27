"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serialize = exports.cannot = exports.can = exports.authorize = exports.allow = exports.CanCan = void 0;
var _compat = require("es-toolkit/compat");
var _errors = require("../errors");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- variance requires `any` to accept arbitrary constructors

/**
 * Class that provides a simple way to define and check authorization abilities.
 * This is originally adapted from https://www.npmjs.com/package/cancan
 */
class CanCan {
  constructor() {
    var _this = this;
    /**
     * Define an authorized ability for a model, action, and target.
     *
     * @param model The model that the ability is for.
     * @param actions The action or actions that are allowed.
     * @param targets The target or targets that the ability applies to.
     * @param condition The condition that must be met for the ability to apply
     */
    _defineProperty(this, "allow", (model, actions, targets, condition) => {
      if (typeof condition !== "undefined" && typeof condition !== "function" && !(0, _compat.isPlainObject)(condition)) {
        throw new TypeError(`Expected condition to be object or function, got ${typeof condition}`);
      }
      if (condition && (0, _compat.isPlainObject)(condition)) {
        condition = this.getConditionFn(condition);
      }
      this.toArray(actions).forEach(action => {
        this.toArray(targets).forEach(target => {
          const ability = {
            model,
            action,
            target,
            condition
          };

          // Add to index
          if (!this.abilities.has(model)) {
            this.abilities.set(model, new Map());
          }
          const actionMap = this.abilities.get(model);
          if (!actionMap.has(action)) {
            actionMap.set(action, []);
          }
          actionMap.get(action).push(ability);
        });
      });
    });
    /**
     * Check if a performer can perform an action on a target.
     *
     * @param performer The performer that is trying to perform the action.
     * @param action The action that the performer is trying to perform.
     * @param target The target that the action is upon.
     * @param options Additional options to pass to the condition function.
     * @returns Whether the performer can perform the action on the target.
     */
    _defineProperty(this, "can", function (performer, action, target) {
      let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      const matchingAbilities = _this.getMatchingAbilities(performer, action, target);

      // Check conditions only for matching abilities
      const seenConditions = new Set();
      const membershipIds = [];
      let hasNonMembershipMatch = false;
      for (const ability of matchingAbilities) {
        if (!ability.condition) {
          continue;
        }
        const result = ability.condition(performer, target, options);
        if (!result || seenConditions.has(result)) {
          continue;
        }
        seenConditions.add(result);
        if (typeof result === "string") {
          membershipIds.push(result);
        } else {
          hasNonMembershipMatch = true;
        }
      }
      return membershipIds.length > 0 ? membershipIds : hasNonMembershipMatch;
    });
    /*
     * Given a user and a model – output an object which describes the actions the
     * user may take against the model. This serialized policy is used for testing
     * and sent in API responses to allow clients to adjust which UI is displayed.
     */
    _defineProperty(this, "serialize", (performer, target) => {
      const output = {};

      // Get all unique actions to check from the index
      const actionsToCheck = new Set();
      for (const [model, actionMap] of this.abilities.entries()) {
        if (performer instanceof model) {
          for (const [action, abilities] of actionMap.entries()) {
            for (const ability of abilities) {
              if (target instanceof ability.target) {
                actionsToCheck.add(action);
                break;
              }
            }
          }
        }
      }

      // Check each unique action once
      actionsToCheck.forEach(action => {
        try {
          output[action] = this.can(performer, action, target);
        } catch (_err) {
          output[action] = false;
        }
      });
      return output;
    });
    /**
     * Check if a performer cannot perform an action on a target, which is the opposite of `can`.
     *
     * @param performer The performer that is trying to perform the action.
     * @param action The action that the performer is trying to perform.
     * @param target The target that the action is upon.
     * @param options Additional options to pass to the condition function.
     * @returns Whether the performer cannot perform the action on the target.
     */
    _defineProperty(this, "cannot", function (performer, action, target) {
      let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return !_this.can(performer, action, target, options);
    });
    /**
     * Guard if a performer can perform an action on a target, throwing an error if they cannot.
     *
     * @param performer The performer that is trying to perform the action.
     * @param action The action that the performer is trying to perform.
     * @param target The target that the action is upon.
     * @param options Additional options to pass to the condition function.
     * @throws AuthorizationError If the performer cannot perform the action on the target.
     */
    _defineProperty(this, "authorize", function (performer, action, target) {
      let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (_this.cannot(performer, action, target, options)) {
        throw (0, _errors.AuthorizationError)("Authorization error");
      }
    });
    // Private methods
    _defineProperty(this, "getMatchingAbilities", (performer, action, target) => {
      const matchingAbilities = [];

      // Use index to find abilities by model and action
      for (const [model, actionMap] of this.abilities.entries()) {
        if (!(performer instanceof model)) {
          continue;
        }

        // Check for specific action
        const specificAbilities = actionMap.get(action);
        if (specificAbilities) {
          for (const ability of specificAbilities) {
            if (ability.target === "all" || target === ability.target || target instanceof ability.target) {
              matchingAbilities.push(ability);
            }
          }
        }

        // Check for "manage" action (applies to all actions)
        const manageAbilities = actionMap.get("manage");
        if (manageAbilities) {
          for (const ability of manageAbilities) {
            if (ability.target === "all" || target === ability.target || target instanceof ability.target) {
              matchingAbilities.push(ability);
            }
          }
        }
      }
      return matchingAbilities;
    });
    // Index for fast lookups: Map<model, Map<action, Ability[]>>
    _defineProperty(this, "abilities", new Map());
    _defineProperty(this, "get", (obj, key) => "get" in obj && typeof obj.get === "function" ? obj.get(key) : obj[key]);
    _defineProperty(this, "isPartiallyEqual", (target, obj) => Object.keys(obj).every(
    // @ts-expect-error TODO
    key => this.get(target, key) === obj[key]));
    _defineProperty(this, "getConditionFn", condition => (performer, target) => this.isPartiallyEqual(target, condition));
    _defineProperty(this, "toArray", value => {
      if (value === null || value === undefined) {
        return [];
      }
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "string") {
        return [value];
      }
      // @ts-expect-error - TS doesn't know that value is iterable
      if (typeof value[Symbol.iterator] === "function") {
        // @ts-expect-error - TS doesn't know that value is iterable
        return [...value];
      }
      return [value];
    });
  }
}
exports.CanCan = CanCan;
const cancan = new CanCan();
const {
  allow,
  can,
  cannot,
  serialize
} = cancan;

// This is exported separately as a workaround for the following issue:
// https://github.com/microsoft/TypeScript/issues/36931
exports.serialize = serialize;
exports.cannot = cannot;
exports.can = can;
exports.allow = allow;
const authorize = exports.authorize = cancan.authorize;

// The MIT License (MIT)

// Copyright (c) Vadim Demedes <vdemedes@gmail.com> (github.com/vadimdemedes)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.