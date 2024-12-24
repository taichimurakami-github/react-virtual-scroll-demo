import { createRangeArray } from "./basics";

test("createRangeArray w/o min", () => {
  const result = createRangeArray(5);
  expect(result).toEqual([0, 1, 2, 3, 4]);
});

test("createRangeArray with min", () => {
  const result = createRangeArray(5, 3);
  expect(result).toEqual([3, 4, 5, 6, 7]);
});
