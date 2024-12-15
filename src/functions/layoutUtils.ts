export const calcNumRowsTotal = (nItems: number, nColumns: number) =>
  nItems % nColumns === 0
    ? Math.trunc(nItems / nColumns)
    : Math.trunc(nItems / nColumns) + 1;

export const calcFixedNumRows = (
  vpHeight: number,
  rowHeight: number,
  nBuffer: number
) => {
  const nRowsMinInViewed = Math.ceil(vpHeight / rowHeight) + 1;
  const nRowsBuffer = nBuffer * 2;

  return nRowsMinInViewed + nRowsBuffer;
};

export const calcRenderRowRange = (
  vpTop: number,
  vpBottom: number,
  rowHeight: number,
  max: number,
  min: number = 0,
  nBuffer: number = 1
): [min: number, max: number] => {
  const nRowIdMin = Math.max(min, Math.trunc(vpTop / rowHeight) - nBuffer);
  const nRowIdMax = Math.min(Math.trunc(vpBottom / rowHeight) + nBuffer, max);
  return [nRowIdMin, nRowIdMax];
};

export const calcRowsListFromRange = (nRowMin: number, nRowMax: number) =>
  new Array(nRowMax - nRowMin + 1).fill(0).map((_, i) => i + nRowMin);

export const calcItemsListFromRow = (rowId: number, nColumns: number) =>
  new Array(nColumns).fill(0).map((_, i) => i + rowId * nColumns);

export const calcItemsListFromRowRange = (
  nRowMin: number,
  nRowMax: number,
  nColumns: number
) =>
  new Array(nRowMax - nRowMin + 1)
    .fill(0)
    .flatMap((_, i) => calcItemsListFromRow(i + nRowMin, nColumns))
    .sort((a, b) => a - b);

export const calcScrollDirection = (
  prevRowRange: [number, number],
  currRowRange: [number, number]
): -1 | 1 | 0 =>
  prevRowRange[0] > currRowRange[0] || prevRowRange[1] > currRowRange[1] // min, max時のclampを考慮して両方見る
    ? 1 // down scroll
    : prevRowRange[0] < currRowRange[0] || prevRowRange[1] < currRowRange[1] // min, max時のclampを考慮して両方見る
    ? -1 // up scroll
    : 0; // no scroll (may be scrolled, but no need to update contents)

export const calcFirstItemInRow = (rowId: number, nColumns: number) =>
  rowId * nColumns;
