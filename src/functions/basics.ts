export const createRangeArray = (n: number, min: number = 0) =>
  new Array(n).fill(0).map((_, i) => i + min);
