"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diffAny = diffAny;
exports.diffArrays = diffArrays;
exports.diffObjects = diffObjects;
exports.intersection = intersection;
exports.isDestructive = isDestructive;
exports.subtract = subtract;
var _compat = require("es-toolkit/compat");
var _util = require("./util");
/**
 * All diff* functions should return a list of operations, often empty.
 *
 * Each operation should be an object with two to four fields:
 * - `op`: the name of the operation; one of "add", "remove", "replace", "move",
 *   "copy", or "test".
 * - `path`: a JSON pointer string
 * - `from`: a JSON pointer string
 * - `value`: a JSON value
 *
 * The different operations have different arguments.
 * - "add": [`path`, `value`]
 * - "remove": [`path`]
 * - "replace": [`path`, `value`]
 * - "move": [`from`, `path`]
 * - "copy": [`from`, `path`]
 * - "test": [`path`, `value`]
 *
 * Currently this only really differentiates between Arrays, Objects, and
 * Everything Else, which is pretty much just what JSON substantially
 * differentiates between.
 */

function isDestructive(_ref) {
  let {
    op
  } = _ref;
  return op === "remove" || op === "replace" || op === "copy" || op === "move";
}

/**
 * VoidableDiff exists to allow the user to provide a partial diff(...) function,
 * falling back to the built-in diffAny(...) function if the user-provided function
 * returns void.
 */

/**
 * List the keys in `minuend` that are not in `subtrahend`.
 *
 * A key is only considered if it is both 1) an own-property (o.hasOwnProperty(k))
 * of the object, and 2) has a value that is not undefined. This is to match JSON
 * semantics, where JSON object serialization drops keys with undefined values.
 *
 * @param minuend - object of interest.
 * @param subtrahend - object of comparison.
 * @returns array of keys that are in `minuend` but not in `subtrahend`.
 */
function subtract(minuend, subtrahend) {
  // initialize empty object; we only care about the keys, the values can be anything
  const obj = {};
  // build up obj with all the properties of minuend
  for (const add_key in minuend) {
    if ((0, _util.hasOwn)(minuend, add_key) && minuend[add_key] !== undefined) {
      obj[add_key] = 1;
    }
  }
  // now delete all the properties of subtrahend from obj
  // (deleting a missing key has no effect)
  for (const del_key in subtrahend) {
    if ((0, _util.hasOwn)(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
      delete obj[del_key];
    }
  }
  // finally, extract whatever keys remain in obj
  return Object.keys(obj);
}

/**
 * List the keys that shared by all `objects`.
 *
 * The semantics of what constitutes a "key" is described in subtract.
 *
 * @param objects - array of objects to compare.
 * @returns array of keys that are in ("own-properties" of) every object in `objects`.
 */
function intersection(objects) {
  const length = objects.length;
  // prepare empty counter to keep track of how many objects each key occurred in
  const counter = {};
  // go through each object and increment the counter for each key in that object
  for (let i = 0; i < length; i++) {
    const object = objects[i];
    for (const key in object) {
      if ((0, _util.hasOwn)(object, key) && object[key] !== undefined) {
        counter[key] = (counter[key] || 0) + 1;
      }
    }
  }
  // now delete all keys from the counter that were not seen in every object
  for (const key in counter) {
    if (counter[key] < length) {
      delete counter[key];
    }
  }
  // finally, extract whatever keys remain in the counter
  return Object.keys(counter);
}

/** These are not proper Operation objects, but will be converted into
Operation objects eventually. {index} indicates the actual target position,
never 'end-of-array' */

function isArrayAdd(array_operation) {
  return array_operation.op === "add";
}
function isArrayRemove(array_operation) {
  return array_operation.op === "remove";
}
function buildOperations(memo, i, j) {
  let memoized = memo[i][j];
  if (!memoized) {
    throw new Error("invalid memo");
  }
  const operations = [];
  while (memoized && memoized.prevI >= 0 && memoized.operation) {
    operations.push(memoized.operation);
    memoized = memo[memoized.prevI][memoized.prevJ];
  }
  return operations.reverse();
}

/**
 * Calculate the shortest sequence of operations to get from `input` to `output`,
 * using a dynamic programming implementation of the Levenshtein distance algorithm.
 *
 * To get from the input ABC to the output AZ we could just delete all the input
 * and say "insert A, insert Z" and be done with it. That's what we do if the
 * input is empty. But we can be smarter.
 *
 *           output
 *                A   Z
 *                -   -
 *           [0]  1   2
 * input A |  1  [0]  1
 *       B |  2  [1]  1
 *       C |  3   2  [2]
 *
 * 1) start at 0,0 (+0)
 * 2) keep A (+0)
 * 3) remove B (+1)
 * 4) replace C with Z (+1)
 *
 * If the `input` (source) is empty, they'll all be in the top row, resulting in an
 * array of 'add' operations.
 * If the `output` (target) is empty, everything will be in the left column,
 * resulting in an array of 'remove' operations.
 *
 * @returns a list of add/remove/replace operations.
 */
function diffArrays(input, output, ptr) {
  let diff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : diffAny;
  // handle weird objects masquerading as Arrays that don't have proper length
  // properties by using 0 for everything but positive numbers
  const input_length = isNaN(input.length) || input.length <= 0 ? 0 : input.length;
  const output_length = isNaN(output.length) || output.length <= 0 ? 0 : output.length;

  // Skip matching prefix
  let start = 0;
  while (start < input_length && start < output_length && (0, _compat.isEqual)(input[start], output[start])) {
    start++;
  }

  // Skip matching suffix
  let input_end = input_length;
  let output_end = output_length;
  while (input_end > start && output_end > start) {
    if ((0, _compat.isEqual)(input[input_end - 1], output[output_end - 1])) {
      input_end--;
      output_end--;
    } else {
      break;
    }
  }

  // Calculate the size of the subproblem
  const subInput = input_end - start;
  const subOutput = output_end - start;
  const memo = new Array(subInput + 1);
  for (let i = 0; i <= subInput; i++) {
    memo[i] = new Array(subOutput + 1);
  }
  memo[0][0] = {
    prevI: -1,
    prevJ: -1,
    operation: null,
    cost: 0
  };
  for (let i = 0; i <= subInput; i++) {
    for (let j = 0; j <= subOutput; j++) {
      let memoized = memo[i][j];
      if (memoized) {
        continue;
      }

      // Map back to original array indices
      const inputIdx = start + i - 1;
      const outputIdx = start + j - 1;
      if (j === 0) {
        memoized = {
          prevI: i - 1,
          prevJ: j,
          operation: {
            op: "remove",
            index: inputIdx
          },
          cost: memo[i - 1][j].cost + 1
        };
      } else if (i === 0) {
        memoized = {
          prevI: i,
          prevJ: j - 1,
          operation: {
            op: "add",
            index: inputIdx,
            value: output[outputIdx]
          },
          cost: memo[i][j - 1].cost + 1
        };
      } else {
        if ((0, _compat.isEqual)(input[inputIdx], output[outputIdx])) {
          memoized = memo[i - 1][j - 1];
        } else {
          const remove_prev = memo[i - 1][j];
          const add_prev = memo[i][j - 1];
          const replace_prev = memo[i - 1][j - 1];
          const min_cost = Math.min(replace_prev.cost, add_prev.cost, remove_prev.cost);
          if (remove_prev.cost === min_cost) {
            memoized = {
              prevI: i - 1,
              prevJ: j,
              operation: {
                op: "remove",
                index: inputIdx
              },
              cost: remove_prev.cost + 1
            };
          } else if (add_prev.cost === min_cost) {
            memoized = {
              prevI: i,
              prevJ: j - 1,
              operation: {
                op: "add",
                index: inputIdx,
                value: output[outputIdx]
              },
              cost: add_prev.cost + 1
            };
          } else {
            memoized = {
              prevI: i - 1,
              prevJ: j - 1,
              operation: {
                op: "replace",
                index: inputIdx,
                original: input[inputIdx],
                value: output[outputIdx]
              },
              cost: replace_prev.cost + 1
            };
          }
        }
      }
      memo[i][j] = memoized;
    }
  }
  const array_operations = buildOperations(memo, subInput, subOutput);
  const [padded_operations] = array_operations.reduce((_ref2, array_operation) => {
    let [operations, padding] = _ref2;
    if (isArrayAdd(array_operation)) {
      const padded_index = array_operation.index + 1 + padding;
      const index_token = padded_index < input_length + padding ? String(padded_index) : "-";
      const operation = {
        op: array_operation.op,
        path: ptr.add(index_token).toString(),
        value: array_operation.value
      };
      // padding++ // maybe only if array_operation.index > -1 ?
      return [operations.concat(operation), padding + 1];
    } else if (isArrayRemove(array_operation)) {
      const operation = {
        op: array_operation.op,
        path: ptr.add(String(array_operation.index + padding)).toString()
      };
      // padding--
      return [operations.concat(operation), padding - 1];
    } else {
      // replace
      const replace_ptr = ptr.add(String(array_operation.index + padding));
      const replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
      return [operations.concat(...replace_operations), padding];
    }
  }, [[], 0]);
  return padded_operations;
}
function diffObjects(input, output, ptr) {
  let diff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : diffAny;
  // if a key is in input but not output -> remove it
  const operations = [];
  subtract(input, output).forEach(key => {
    operations.push({
      op: "remove",
      path: ptr.add(key).toString()
    });
  });
  // if a key is in output but not input -> add it
  subtract(output, input).forEach(key => {
    operations.push({
      op: "add",
      path: ptr.add(key).toString(),
      value: output[key]
    });
  });
  // if a key is in both, diff it recursively
  intersection([input, output]).forEach(key => {
    operations.push(...diff(input[key], output[key], ptr.add(key)));
  });
  return operations;
}

/**
 * `diffAny()` returns an empty array if `input` and `output` are materially equal
 * (i.e., would produce equivalent JSON); otherwise it produces an array of patches
 * that would transform `input` into `output`.
 *
 * > Here, "equal" means that the value at the target location and the
 * > value conveyed by "value" are of the same JSON type, and that they
 * > are considered equal by the following rules for that type:
 * > o  strings: are considered equal if they contain the same number of
 * >    Unicode characters and their code points are byte-by-byte equal.
 * > o  numbers: are considered equal if their values are numerically
 * >    equal.
 * > o  arrays: are considered equal if they contain the same number of
 * >    values, and if each value can be considered equal to the value at
 * >    the corresponding position in the other array, using this list of
 * >    type-specific rules.
 * > o  objects: are considered equal if they contain the same number of
 * >    members, and if each member can be considered equal to a member in
 * >    the other object, by comparing their keys (as strings) and their
 * >    values (using this list of type-specific rules).
 * > o  literals (false, true, and null): are considered equal if they are
 * >    the same.
 */
function diffAny(input, output, ptr) {
  let diff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : diffAny;
  // strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
  if (input === output) {
    return [];
  }
  const input_type = (0, _util.objectType)(input);
  const output_type = (0, _util.objectType)(output);
  if (input_type === "array" && output_type === "array") {
    return diffArrays(input, output, ptr, diff);
  }
  if (input_type === "object" && output_type === "object") {
    return diffObjects(input, output, ptr, diff);
  }
  // at this point we know that input and output are materially different;
  // could be array -> object, object -> array, boolean -> undefined,
  // number -> string, or some other combination, but nothing that can be split
  // up into multiple patches: so `output` must replace `input` wholesale.
  return [{
    op: "replace",
    path: ptr.toString(),
    value: output
  }];
}