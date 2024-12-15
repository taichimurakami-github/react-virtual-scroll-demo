import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CardContent from "./CardContent";
import { VirtualScrollWrapperProps } from "./ScrollerSection";
import {
  calcFixedNumRows,
  calcItemsListFromRow,
  calcNumRowsTotal,
  calcRenderRowRange,
  calcRowsListFromRange,
  calcScrollDirection,
} from "../functions/layoutUtils";

type RenderRows = {
  rowId: number | null; // 最後のitemがレンダリングされる際，items.lengthによってrowが余る場合を考慮
  uid: number;
}[];

type RenderContext = {
  rowRange: [number, number];
};

type StaticVirtualScrollWrapperProps = VirtualScrollWrapperProps & {
  initScrollY?: number;
  nColumns?: number;
  rowBuffer?: number;
};

// Single-column only
// TODO: カラム数にかかわらず使えるように汎用化したい
export default memo(function StaticVirtualScrollWrapper({
  items,
  rowGap,
  colGap = 16,
  itemWidth,
  rowHeight: _rowHeight,
  nColumns = 1,
  initScrollY = 0,
  rowBuffer = 1,
}: StaticVirtualScrollWrapperProps) {
  const nRowsTotal = useMemo(
    () => calcNumRowsTotal(items.length, nColumns),
    [items.length, nColumns]
  );

  const rowHeight = useMemo(() => _rowHeight + rowGap, [_rowHeight, rowGap]);
  const vpHeight = useMemo(() => window.innerHeight, []); // TODO: Consider resize event
  const nRowsFixed = useMemo(
    () => calcFixedNumRows(vpHeight, rowHeight, rowBuffer),
    [vpHeight, rowBuffer]
  );

  const createRenderRows = useCallback(
    (renderRowRange: [number, number]): RenderRows => {
      const newRenderRows: RenderRows = new Array(nRowsFixed)
        .fill(0)
        .map((_, index) => ({
          uid: index,
          rowId: null,
        }));

      // fill new RowList
      const filledRenderRowList = calcRowsListFromRange(
        renderRowRange[0],
        renderRowRange[1]
      );
      for (let i = 0; i < filledRenderRowList.length; i++) {
        const rowId = filledRenderRowList[i];
        const uid = rowId % nRowsFixed;
        newRenderRows[uid].rowId = rowId;
      }

      return newRenderRows;
    },
    []
  );

  const refRenderCtx = useRef<RenderContext>({
    rowRange: calcRenderRowRange(
      window.scrollY,
      window.innerHeight,
      rowHeight,
      nRowsTotal,
      0,
      1
    ),
  });

  const [renderRows, setRenderRows] = useState<RenderRows>(
    createRenderRows(refRenderCtx.current.rowRange)
  );

  const updateRenderContext = useCallback((rowRange: [number, number]) => {
    refRenderCtx.current.rowRange = rowRange;
  }, []);

  const updateRenderRows = useCallback(() => {
    const scrollY = window.scrollY;

    const rowRange = calcRenderRowRange(
      scrollY,
      scrollY + window.innerHeight,
      rowHeight,
      nRowsTotal - 1
    );

    const scrollDir = calcScrollDirection(
      refRenderCtx.current.rowRange,
      rowRange
    );

    if (scrollDir === 0) {
      // no need to update.
      return;
    }

    updateRenderContext(rowRange);
    setRenderRows(createRenderRows(rowRange));
  }, [calcScrollDirection, updateRenderContext, renderRows, rowHeight]);

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
    const onScrollHandler = handleScroll(updateRenderRows);
    document.addEventListener("scroll", onScrollHandler);
    return () => document.removeEventListener("scroll", onScrollHandler);
  }, [updateRenderRows, handleScroll]);

  const getCardItemElementKey = useCallback(
    (id: number) => `static-dummy_card_content_${id}`,
    []
  );

  const getRenderElements = useCallback(
    (rows: RenderRows): ReactNode[] => {
      const getCardElementKey = (uid: number, iColumn: number) =>
        `static-dummy_card_content_${iColumn + uid * nColumns}`;

      return rows.flatMap(({ rowId, uid }) => {
        const rowElemKey = `static-dummy_card_content-${uid}`;
        const renderItemList =
          rowId != null
            ? calcItemsListFromRow(rowId, nColumns)
            : new Array(nColumns).fill(null);
        const translateY = rowId != null ? rowHeight * rowId : 0;

        return (
          <div
            className="absolute flex items-center top-0 left-1/2 will-change-transform"
            style={{
              gap: `${colGap}px`,
              transform: `translate3d(-50%, ${translateY}px, 0)`,
            }}
            key={rowElemKey}
            id={rowElemKey}
          >
            {renderItemList.map((itemId) => {
              const cardElemKey = `static-dummy_card_content_${
                itemId - renderItemList[0]
              }`;
              return (
                <CardContent
                  id={cardElemKey}
                  key={cardElemKey}
                  data={items[itemId]}
                  width={`${itemWidth}px`}
                  height={`${rowHeight - rowGap}px`}
                  styles={{
                    visibility: rowId != null ? "visible" : "hidden",
                  }}
                />
              );
            })}
          </div>
        );
      });
    },
    [rowHeight, nColumns, rowGap, getCardItemElementKey]
  );

  return getRenderElements(renderRows);
});
