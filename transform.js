const R = require("ramda");

const ARRAY_SIZE = 100000;
const RESULT_LENGTH = Math.floor(ARRAY_SIZE / 2);

// Setup

const counter = {
  next: 0,
  step() {
    return ++this.next;
  },
  reset() {
    this.next = 0;
  }
};

const bigArray = new Array(100001).fill(0);

const getNum = () => counter.step();
const halve = x => x / 2;
const isInt = x => Math.floor(x) === x;

const run = (title, createTest) => {
  counter.reset();
  const testFn = createTest();
  console.time(title);
  const result = testFn();
  console.timeEnd(title);
  console.assert(
    result.length === RESULT_LENGTH,
    `${title} did not return the correct number of results`
  );
};

// Tests

run("Simple", () => {
  return () =>
    bigArray
      .map(getNum)
      .map(halve)
      .filter(isInt);
});

run("Fast fix", () => {
  return () =>
    bigArray.reduce(newArr => {
      const num = getNum();
      const hlv = halve(num);
      if (isInt(hlv)) {
        newArr.push(hlv);
      }
      return newArr;
    }, []);
});

run("Transform 0 (shamefully slow)", () => {
  const transform = (arr, transformer) =>
    arr.reduce((newArr, member) => newArr.concat(transformer([member])), []);
  return () =>
    transform(bigArray, arr =>
      arr
        .map(getNum)
        .map(halve)
        .filter(isInt)
    );
});

run("Transform 1 (using push)", () => {
  const transform = (arr, transformer) =>
    arr.reduce((newArr, member) => {
      const t = transformer([member]);
      if (t.length) {
        newArr.push(t[0]);
      }
      return newArr;
    }, []);

  return () =>
    transform(bigArray, arr =>
      arr
        .map(getNum)
        .map(halve)
        .filter(isInt)
    );
});

run("Transform 2 (semi-imperative)", () => {
  const transform = (arr, transformer) => {
    var member, i, l, t;
    const newArr = [];
    for (i = 0, l = arr.length; i < l; i++) {
      member = arr[i];
      t = transformer([member]);
      if (t.length) {
        newArr.push(t[0]);
      }
    }
    return newArr;
  };

  return () =>
    transform(bigArray, arr =>
      arr
        .map(getNum)
        .map(halve)
        .filter(isInt)
    );
});

run("Generators", () => {
  const map = function*(arr, fn) {
    for (let member of arr) {
      yield fn(member);
    }
  };

  const filter = function*(arr, fn) {
    for (let member of arr) {
      if (fn(member)) {
        yield member;
      }
    }
  };

  return () => {
    const nums = map(bigArray, getNum);
    const hlv = map(nums, halve);
    return [...filter(hlv, isInt)];
  };
});

run("Ramda transducers", () => {
  const ramdaTransformations = R.compose(
    R.map(() => counter.step()),
    R.map(x => x / 2),
    R.filter(x => Math.floor(x) === x)
  );

  return () =>
    R.transduce(ramdaTransformations, R.flip(R.append), [], bigArray);
});
