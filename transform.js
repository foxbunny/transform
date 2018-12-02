const R = require("ramda");

const bigArray = new Array(100000);

const transformations = arr =>
  arr
    .map(() => Math.floor(Math.random() * 499) + 1)
    .map(x => x / 2)
    .filter(x => Math.floor(x) === x);

console.time("simple");
transformations(bigArray);
console.timeEnd("simple");

const transform = (arr, transformer) =>
  arr.reduce((newArr, member) => newArr.concat(transformer([member])), []);

console.time("transform");
transform(bigArray, transformations);
console.timeEnd("transform");

const map = function*(arr, fn) {
  for (let member of arr) {
    yield fn(member);
  }
};

const filter = function*(arr, fn) {
  for (let member of arr) {
    if (fn(member)) {
      yield arr;
    }
  }
};

const toArray = gen => {
  const arr = [];
  for (let member of gen) {
    arr.push(member);
  }
  return arr;
};

console.time("generators");
const rnd = map(bigArray, () => Math.floor(Math.random() * 499) + 1);
const hlv = map(rnd, x => x / 2);
toArray(filter(hlv, x => Math.floor(x) === x));
console.timeEnd("generators");

const ramdaTransformations = R.compose(
  R.map(() => Math.floor(Math.random() * 499) + 1),
  R.map(x => x / 2),
  R.filter(x => Math.floor(x) === x)
);

console.time("transducers");
R.transduce(ramdaTransformations, R.flip(R.append), [], bigArray);
console.timeEnd("transducers");
