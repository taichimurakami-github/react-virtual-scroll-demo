import {
  calcFixedNumRows,
  calcItemsListFromRow,
  calcItemsListFromRowRange,
  calcNumRowsTotal,
  calcRenderRowRange,
  calcRowsListFromRange,
  calcScrollDirection,
} from "./layoutUtils";

test("calcNumRowsTotal case 1", () => {
  const result = calcNumRowsTotal(12, 3);
  expect(result).toBe(4);
});

test("calcNumRowsTotal case 2", () => {
  const result = calcNumRowsTotal(8, 3);
  expect(result).toBe(3);
});

test("calcFixedNumRows case 1", () => {
  const result = calcFixedNumRows(100, 100, 1);
  expect(result).toBe(4);
});

test("calcFixedNumRows case 2", () => {
  const result = calcFixedNumRows(100, 200, 1);
  expect(result).toBe(4);
});

test("calcFixedNumRows case 3", () => {
  const result = calcFixedNumRows(100, 50, 1);
  expect(result).toBe(5);
});

test("calcFixedNumRows case 4", () => {
  const result = calcFixedNumRows(100, 30, 1);
  expect(result).toBe(7);
});

test("calcRenderRowRange case 1: normal", () => {
  const result = calcRenderRowRange(70, 100, 30, 100);
  expect(result).toStrictEqual([1, 4]);
});

test("calcRenderRowRange case 2: min and max", () => {
  const result = calcRenderRowRange(0, 100, 30, 3);
  expect(result).toStrictEqual([0, 3]);
});

test("calcRenderRowRange case 3: on the edge", () => {
  const result = calcRenderRowRange(60, 120, 30, 100);
  expect(result).toStrictEqual([1, 5]);
});

test("calcRowsListFromRange case 1", () => {
  const result = calcRowsListFromRange(0, 2);
  expect(result).toStrictEqual([0, 1, 2]);
});

test("calcItemsListFromRow case 1", () => {
  const result = calcItemsListFromRow(0, 3);
  expect(result).toStrictEqual([0, 1, 2]);
});

test("calcItemsListFromRow case 2", () => {
  const result = calcItemsListFromRow(2, 4);
  expect(result).toStrictEqual([8, 9, 10, 11]);
});

test("calcItemsListFromRowRange case 1", () => {
  const result = calcItemsListFromRowRange(0, 1, 3);
  expect(result).toStrictEqual([0, 1, 2, 3, 4, 5]);
});

test("calcItemsListFromRowRange case 2", () => {
  const result = calcItemsListFromRowRange(2, 4, 3);
  expect(result).toStrictEqual([6, 7, 8, 9, 10, 11, 12, 13, 14]);
});

test("calcScrollDirection case 1: up", () => {
  const result = calcScrollDirection([10, 11], [11, 12]);
  expect(result).toEqual(-1);
});

test("calcScrollDirection case 2: up (edge)", () => {
  const result = calcScrollDirection([10, 12], [11, 12]);
  expect(result).toEqual(-1);
});

test("calcScrollDirection case 3: down", () => {
  const result = calcScrollDirection([10, 11], [9, 10]);
  expect(result).toEqual(1);
});

test("calcScrollDirection case 4: down (edge)", () => {
  const result = calcScrollDirection([0, 2], [0, 1]);
  expect(result).toEqual(1);
});

test("calcScrollDirection case 5: no scroll", () => {
  const result = calcScrollDirection([0, 2], [0, 2]);
  expect(result).toEqual(0);
});
