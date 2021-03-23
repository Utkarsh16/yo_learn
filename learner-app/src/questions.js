/**
 * ! Question - 1
 * summing args using a callback
 */
const sumByCallback = (callback, ...args) => {
  if (args?.length === 1) return args[0];
  args.splice(0, 2, callback(args[0], args[1]));
  return sumByCallback(callback, ...args);
}
const sum = (a, b) => a + b;
console.log(sumByCallback(sum, 1, 2, 3, 4, 5))