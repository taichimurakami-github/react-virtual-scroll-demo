import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calcFixedNumRows,
  calcItemsListFromRow,
  calcNumRowsTotal,
  calcRowRangeInView,
  calcScrollDirection,
} from "../functions/layoutUtils";
import { CardData } from "../components/presentational/CardContent";
import { createRangeArray } from "../functions/basics";

type useInfiniteScrollArgs = {
  items: CardData[];
  rowHeight: number;
  rowGap: number;
  rowBuffer: number;
  vpHeight: number /** Viewport Height */;
  nColumns: number;
};

type RowRange = [number, number];

type RowContext = {
  rowId: number | null;
  uid: number;
};

export type RenderContext = (RowContext & {
  itemIdList: (number | null)[]; // item id list
  translateY: number;
})[];

/**
 * スクロールに合わせて，Viewport内に表示されうる行のidを推定し，
 * そこに含まれるitemIdの配列を含むレンダリングコンテキストを生成する
 *
 * TODO: カラム数を増やした状態でテストする
 * TODO: ページ内のY軸方向のどこに配置されても，InView-row推定を正しく計算する
 */
export default function useInfiniteScrollRenderContext({
  items,
  rowHeight: _rowHeight,
  rowGap,
  rowBuffer,
  vpHeight,
  nColumns,
}: useInfiniteScrollArgs): RenderContext {
  const nRowsTotal = useMemo(
    () => calcNumRowsTotal(items.length, nColumns),
    [items.length, nColumns]
  );
  const rowHeight = useMemo(() => _rowHeight + rowGap, [_rowHeight, rowGap]);
  const nRowsInViewMax = useMemo(
    () => calcFixedNumRows(vpHeight, rowHeight, rowBuffer),
    [vpHeight, rowBuffer]
  );

  const createRenderRowsContext = useCallback(
    (renderRowRange: [number, number]): RowContext[] => {
      /**
       * 画面内に描画できる最大行数分の各行に関する情報
       * 上端・下端で描画対象外としてはみ出た行は，rowIdをnullとして検知する
       */

      // 描画するrows
      const rowsToRender = createRangeArray(
        renderRowRange[1] - renderRowRange[0] + 1,
        renderRowRange[0]
      );

      // 描画するrows -> rowsContext生成
      // 描画しないrowsは
      const rowsCtx: RowContext[] = new Array(nRowsInViewMax)
        .fill(0)
        .map((_, index) => ({
          uid: index,
          rowId: null,
        }));

      // uidに合致するrowIdを計算して埋める
      for (let i = 0; i < rowsToRender.length; i++) {
        const rowId = rowsToRender[i];
        const uid = rowId % nRowsInViewMax;
        rowsCtx[uid].rowId = rowId;
      }

      return rowsCtx;
    },
    [nRowsInViewMax]
  );

  const createRenderContext = useCallback(
    (rowsCtx: RowContext[]): RenderContext => {
      // rowsCtxをベースに，renderCtxを作成
      const renderCtx = new Array<RenderContext[number]>(rowsCtx.length);
      const len = rowsCtx.length;

      for (let i = 0; i < len; i++) {
        const rowId = rowsCtx[i].rowId;
        const uid = rowsCtx[i].uid;
        const itemIdList =
          rowId === null
            ? // 行内にitemが１つも無い場合 -> null[]
              new Array(nColumns).fill(null)
            : // 行にitemが１つ以上含まれる場合 -> (number|null)[]
              calcItemsListFromRow(rowId, nColumns).map((itemId) =>
                0 <= itemId && itemId < items.length ? itemId : null
              );
        const translateY = rowId != null ? rowHeight * rowId : 0;

        renderCtx[i] = {
          rowId,
          uid,
          itemIdList,
          translateY,
        };
      }

      return renderCtx;
    },
    [nColumns, nRowsInViewMax]
  );

  const refRenderRowRange = useRef<RowRange>(
    calcRowRangeInView(
      window.scrollY,
      window.innerHeight,
      rowHeight,
      nRowsTotal,
      0,
      1
    )
  );

  const [renderContext, setRenderContext] = useState<RenderContext>(
    createRenderContext(createRenderRowsContext(refRenderRowRange.current))
  );

  const updateRowRange = useCallback((rowRange: [number, number]) => {
    refRenderRowRange.current = rowRange;
  }, []);

  const updateRenderContext = useCallback(() => {
    const scrollY = window.scrollY;

    const rowRange = calcRowRangeInView(
      scrollY,
      scrollY + window.innerHeight,
      rowHeight,
      nRowsTotal - 1
    );

    const scrollDir = calcScrollDirection(refRenderRowRange.current, rowRange);

    if (scrollDir === 0) {
      // no need to update.
      return;
    }

    updateRowRange(rowRange);
    const newRenderContext = createRenderContext(
      createRenderRowsContext(rowRange)
    );
    setRenderContext(newRenderContext);
  }, [calcScrollDirection, updateRowRange, createRenderContext, rowHeight]);

  const refTicking = useRef(false);
  const handleScroll = useCallback(
    (handler: (e: Event) => void) => (e: Event) => {
      // とりあえず更新頻度は1フレに1回に制限
      if (!refTicking.current) {
        refTicking.current = true;
        requestAnimationFrame(() => {
          handler(e);
          refTicking.current = false;
        });
      }
    },
    []
  );

  useEffect(() => {
    const onScrollHandler = handleScroll(updateRenderContext);
    document.addEventListener("scroll", onScrollHandler);
    return () => document.removeEventListener("scroll", onScrollHandler);
  }, [updateRenderContext, handleScroll]);

  return renderContext;
}
