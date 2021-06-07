// ? ARRAY POLYFILLS ---------------------------------------------
// * Map
Array.prototype.myMap = function (cb) {
  // safety checks
  const arr = this;
  const result = [];
  for (let value of arr) {
    result.push(cb(value));
  }
  return result;
};

// * Filter
Array.prototype.myFilter = function (cb) {
  const arr = this;
  const result = [];
  for (let value of arr) {
    if (cb(value)) result.push(value);
  }
  return result;
};

// * Reduce
Array.prototype.myReduce = function (cb, aggregate) {
  const arr = this;
  let agg = aggregate;
  for (let value of arr) {
    agg = agg ? cb(agg, value) : value;
  }
  return agg;
};

// ? FUNCTION POLYFILLS ---------------------------------------------
// * Bind
Function.prototype.mybind = function (context, ...args1) {
  // safety checks
  context.func = this;
  return function (...args2) {
    return context.func(...args1, ...args2);
  };
};
// * Bind - Using Apply
Function.prototype.mybind = function (context, ...args1) {
  // safety checks
  const func = this;
  return function (...args2) {
    return func.apply(context, [...args1, ...args2]);
  };
};

// * Apply
Function.prototype.myApply = function (context, args = []) {
  // safety checks
  context.func = this;
  context.func(...args);
};

// * Call
Function.prototype.myCall = function (context, ...args) {
  // safety checks
  context.func = this;
  context.func(...args);
};

// ? PROMISE POLYFILL ---------------------------------------------
// * Promise
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
