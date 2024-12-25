/**
 * @file Utils for constructing layouts
 * @remarks
 * - V8ならnew Array() を使わないほうが速いかも？将来的には環境によって使い分けることも検討
 * - Normal Arrayではなく，Typed Arrayの方が早い可能性がある（特に初期化周り）
 * - カラム数，行数共に大した数値にならないため許容しているが，コスト面では初期化でArray.fillを使わないほうが良いかもしれない
 */

import { createRangeArray } from "./basics";

export const calcNumRowsTotal = (nItems: number, nColumns: number) =>
  nItems % nColumns === 0
    ? Math.trunc(nItems / nColumns)
    : Math.trunc(nItems / nColumns) + 1;

export const calcFixedNumRows = (
  vpHeight: number,
  rowHeight: number,
  nBuffer: number
) => {
  const nRowsMinInViewed = Math.trunc(vpHeight / rowHeight) + 2; // 上下端の一部が映り込むパターンが最大になる分の補正
  const nRowsBuffer = nBuffer * 2; // 上下にバッファを配置

  return nRowsMinInViewed + nRowsBuffer;
};

export const calcRowRangeInView = (
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

export const calcItemsListFromRow = (rowId: number, nColumns: number) =>
  createRangeArray(nColumns, rowId * nColumns); // new Array(nColumns).fill(0).map((_, i) => i + rowId * nColumns);

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

export const calcItemId = (rowId: number, nColumns: number, iColumn: number) =>
  calcFirstItemInRow(rowId, nColumns) + iColumn;
