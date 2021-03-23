// *? debouncing
export const debounce = (callback, delay) => {
  let currentDelay;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(currentDelay);
    currentDelay = setTimeout(() => {
      callback.apply(context, args);
    }, delay);
  }
};

// *? Debounce Function Usage
// debounceBtn.addEventListener("click",
//   debounce(function () {
//     console.warn("Debounced Button Click")
//   }, 3000)
// );

// *? throttling - does not work for 100% of the cases
// does not take into account the last call if it is inside the throttle timer
export const throttle = (callback, timer) => {
  let insideThrottle;
  return function () {
    let context = this;
    let args = arguments;
    if (!insideThrottle) {
      callback.apply(context, args);
      insideThrottle = true;
      setTimeout(() => {
        insideThrottle = false;
      }, timer);
    }
  }
};

// *? Throttle Function Usage
// throttleBtn.addEventListener("click",
//   throttle(function () {
//     console.warn("Throttling");
//   }, 1000)
// );

//full on throttle - takes into account the last function call as well
export const perfectThrottle = (callback, timer) => {
  let lastFunc;
  let lastRan;
  return function () {
    let context = this;
    let args = arguments;
    if (!lastRan) {
      callback.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= timer) {
          callback.apply(context, args);
          lastRan = Date.now();
        }
      }, timer - (Date.now() - lastRan));
    }
  }
};

// Array.prototype.map = funciton(callback, context) {
//     if (this === undefined || this === null) {
//         return new TypeError();
//     }
//     if (typeof (callback) !== 'function') {
//         return new TypeError();
//     }
//     let len = this.length;
//     let res = [];
//     let t = Object(this);
//     for (let index = 0; index < len; index++) {
//         let value = t[i];
//         res[i] = context ? callback.call(context, value, i, t) ? callback(value, i, t);
//     }
// };


//------------------------------------------------------------------------------------------------->>>

// const obj = [
//   { manager: 1, under: [2, 3] },
//   { manager: 2, under: [4] },
//   { manager: 3, under: [] },
//   { manager: 4, under: [4] },
//   { manager: 5, under: [6] },
//   { manager: 6, under: [] }
// ]

// const xyz = {
//   1: [2, 3],
//   2: [4],
//   3: [],
//   4: [],
//   5: [6],
//   6: []
// }

// let arr = [];

// for (let key of Object.keys(xyz)) {
//   arr.push(key);
//   arr.push(...xyz[key].map(value => value));
// }

// const node = ({ value, left, right }) => ({
//   [value]: [left, right]
// });

// const recurFunction = (obj) => {
//   let keys = Object.keys(obj);
//   let startValue = keys[0];

//   let combined = { ...node({ value: startValue, left: null, right: null }) };

//   for (let key of keys) {
//     let value = key;
//     let left = obj[key][0];
//     let right = obj[key][1];

//     let newNode = node({ value, left, right });
//   }
// }

// {
//     1: {
//         2:
//     }
// }

// { AND: [0, { OR: [1, 1] }] }

//   = { AND: [0, 1] }
//   = 0



// const parseFunction = (obj) => {
//   let key = Object.keys(obj)[0];
//   let value = obj[key];

//   if (Array.isArray(value)) {
//     let result;
//     switch (key) {
//       case 'AND':
//         result = value.reduce((accumulater, value) => accumulater & value, value[0]);
//         break;
//       case 'OR':
//         result = value.reduce((accumulater, value) => accumulater | value, value[0]);
//         break;
//       case 'NOT':
//         result = !value[0];
//         break;
//       default: break;
//     }
//     return result;
//   }
//   return parseFunction(value);
// }