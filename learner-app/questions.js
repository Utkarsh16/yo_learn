/**
 * ! Question - 1
 * summing args using a callback
 */
const sumByCallback = (callback, ...args) => {
  if (args?.length === 1) return args[0];
  args.splice(0, 2, callback(args[0], args[1]));
  return sumByCallback(callback, ...args);
};
const sum = (a, b) => a + b;
console.log(sumByCallback(sum, 1, 2, 3, 4, 5));

/**
 * ! Question - 2
 * Bind, Call, Apply Polyfill
 */
// Native
Function.prototype.mybind = function (context, ...args1) {
  // safety checks
  context.func = this;
  return function (...args2) {
    return context.func(...args1, ...args2);
  };
};
Function.prototype.myApply = function (context, args = []) {
  // safety checks
  context.func = this;
  context.func(...args);
};
Function.prototype.myCall = function (context, ...args) {
  // safety checks
  context.func = this;
  context.func(...args);
};

// Using Apply
Function.prototype.mybind = function (context, ...args1) {
  // safety checks
  const func = this;
  return function (...args2) {
    return func.apply(context, [...args1, ...args2]);
  };
};

/**
 * ! Question - 3
 * Bind, Call, Apply Polyfill
 */
class MyPromise {
  constructor(callback) {
    let onResolve,
      onReject,
      fullfilled,
      called,
      rejected,
      resolveValue,
      rejectError;

    function resolve(value) {
      fullfilled = true;
      resolveValue = value;

      if (typeof onResolve === "function") {
        called = true;
        onResolve(resolveValue);
      }
    }

    function reject(error) {
      rejected = true;
      rejectError = error;

      if (typeof onReject === "function") {
        called = true;
        onReject(rejectError);
      }
    }

    this.then = function (thenCallback) {
      onResolve = thenCallback;

      if (fullfilled && !called) {
        called = true;
        onResolve(resolveValue);
      }
      return this;
    };

    this.catch = function (catchCallback) {
      onReject = catchCallback;

      if (rejected && !called) {
        called = true;
        onReject(rejectError);
      }
      return this;
    };

    callback(resolve, reject);
  }
}

MyPromise.resolve = (value) =>
  new MyPromise((resolve, _reject) => resolve(value));
MyPromise.reject = (reason) =>
  new MyPromise((_resolve, reject) => reject(reason));

MyPromise.all = (promises) => {
  let fullfilledPromises = [],
    result = [];
  function executor(resolve, reject) {
    promises.forEach((promise, index) => {
      promise
        .then((resolveValue) => {
          fullfilledPromises.push(promise);
          result[index] = resolveValue;

          if (fullfilledPromises.length === promises.length) {
            return resolve(result);
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  return new MyPromise(executor);
};

/**
 * ! Question - 4
 * Two way binding
 */
const inputEl = document.getElementById("test_input");
const btn = document.getElementById("test_alert_button");
const btnUpdate = document.getElementById("test_update_button");
const bindedObject = {
  get value() {
    return this._value;
  },
  set value(newValue) {
    this._value = newValue;
    inputEl.value = newValue;
  },
};
inputEl.addEventListener("keyup", (event) => {
  bindedObject.value = event.target.value;
});
btn.addEventListener("click", function () {
  console.log(bindedObject.value);
});
btnUpdate.addEventListener("click", function () {
  bindedObject.value = "Happy";
});

/**
 * ! Question - 5
 * mul(2)(3)(4)(5)....(n)()
 */
let value = 1;
const mul = (a) => {
  if (a) {
    value *= a;
    return function (b) {
      return mul(b);
    };
  } else {
    console.log("value", value);
    return value;
  }
};

/**
 * ! Question - 6
 * flatten an array
 */
const arr = [[1], [2, 3], [4], [3, [2, 4]]];
const result = [];
const flatten = (arr) => {
  for (let value of arr) {
    if (Array.isArray(value)) {
      flatten(value);
    } else {
      result.push(value);
    }
  }
};

/**
 * ! Question - 7
 * company relationship tree
 */
const arr = [
  { id: 1, mid: 3 },
  { id: 2, mid: 3 },
  { id: 3, mid: 7 },
  { id: 4, mid: 3 },
  { id: 5, mid: 4 },
  { id: 6, mid: 4 },
  { id: 7 },
  { id: 8, mid: 5 },
  { id: 9, mid: 7 },
  { id: 10, mid: 9 },
  { id: 11, mid: 9 },
];

const obj = {};
let ceo = null;
const getObj = (arr) => {
  arr.forEach(({ id, mid }) => {
    if (!mid) ceo = id;
    else if (obj.hasOwnProperty(mid)) {
      obj[mid] = [...obj[mid], id];
    } else obj[mid] = [id];
  });
};

const parentDiv = document.getElementById("compnay_series");
let chain = "";
const createCompanyTree = (obj, current, margin) => {
  chain += `<div style="margin-left: ${margin}px;">${current}`;

  const employeesUnder = obj[current];
  for (let employee of employeesUnder) {
    if (obj[employee]) {
      createCompanyTree(obj, employee, margin + 10, chain);
    } else {
      const childDiv = `<div style="margin-left: ${margin}px;">${employee}</div>`;
      chain += childDiv;
    }
  }
  chain += "</div>";
};

getObj(arr);
createCompanyTree(obj, ceo, 0);

parentDiv.innerHTML = chain;

/**
 * ! Question - 8
 * Find pair from Array with exact sum
 */
const arr = [0, -1, 2, -3, 1]; // -3 -1 0 1 2
const sum = -2;

const findPair = (arr, sum) => {
  const obj = {};
  let first = null;
  let second = null;
  arr.forEach((value) => {
    if (obj.hasOwnProperty([sum - value])) {
      [first, second] = [value, sum - value];
      return;
    } else obj[value] = sum - value;
  });
  return [first, second];
};

console.log(findPair(arr, sum));
