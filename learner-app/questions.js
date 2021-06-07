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
 * ! Question - 3
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
 * ! Question - 4
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
 * ! Question - 5
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
 * ! Question - 6
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

/**
 * ! Question - 7
 * Generate Binary Numbers from 1 - n (used Queue)
 */
const n = 10;
class Q {
  constructor() {
    this.q = [];
  }
  enq(value) {
    this.q.push(value);
  }
  dq() {
    return this.q.shift();
  }
}

const q = new Q();
let result = [];
q.enq("1");
for (let index = 1; index <= n; index++) {
  const first = q.dq();
  result.push(first);
  q.enq(`${first}0`);
  q.enq(`${first}1`);
}
console.log(result);

/**
 * ! Question - 8
 * Merge overlapping ranges in an array - Stack used!
 */
let arr = [
  [6, 8],
  [1, 9],
  [2, 4],
  [4, 7],
  [5, 7],
];

class Stack {
  constructor() {
    this.arr = [];
  }
  push(value) {
    this.arr.push(value);
  }
  pop() {
    if (this.arr.length > 0) return this.arr.pop();
  }
  top() {
    if (this.arr.length > 0) return this.arr[this.arr.length - 1];
  }
  print() {
    return JSON.stringify(this.arr);
  }
}

const mergeOverlappingRanges = (arr) => {
  const s = new Stack();
  s.push(arr[0]);
  for (let i = 1; i < arr.length; i++) {
    const range1 = s.top();
    const range2 = arr[i];
    if (range1[range1.length - 1] >= range2[0]) {
      const combined = [...range1, ...range2];
      s.pop();
      s.push([Math.min(...combined), Math.max(...combined)]);
    } else s.push(arr[i]);
  }
  return s.print();
};

const result = mergeOverlappingRanges(arr1.sort());
console.log(JSON.stringify(result));
