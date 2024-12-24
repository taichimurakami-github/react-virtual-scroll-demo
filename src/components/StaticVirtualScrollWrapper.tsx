import { memo } from "react";
import CardContent from "./presentational/CardContent";
import { VirtualScrollWrapperCommonProps } from "./InfiniteScrollerSection";
import useInfiniteScrollRenderContext from "../hooks/useInfiniteScrollRenderContext";
import ListRowContainer from "./presentational/ListRowContainer";

/**
 * DOMの生成・破棄を極力防ぎ，既存の要素を再利用することで，
 * ブラウザのレンダリングパイプラインに最適化させる実装の無限スクロール
 */
export default memo(function StaticVirtualScrollWrapper({
  items,
  rowGap,
  colGap = 16,
  itemWidth,
  rowHeight,
  nColumns = 1,
  rowBuffer = 1,
}: VirtualScrollWrapperCommonProps) {
  const renderContext = useInfiniteScrollRenderContext({
    items,
    rowGap,
    rowHeight,
    rowBuffer,
    vpHeight: window.innerHeight,
    nColumns,
  });

  return renderContext.map(({ rowId, uid, itemIdList, translateY }) => {
    const rowElemKey = `static-dummy_card_content_row-${uid}`; // rowIdではなくuidにすることで，同じdiv要素を再利用する
    return (
      <ListRowContainer
        key={rowElemKey}
        id={rowElemKey}
        colGap={colGap}
        translateY={translateY}
        active={rowId !== null}
      >
        {itemIdList.map((itemId, iColumn) => {
          const itemData = itemId === null ? null : items[itemId];
          const cardElemKey = `static-dummy_card_content_card-${rowId}-${iColumn}`; // columnの位置が同じだったら使いまわす
          return (
            <CardContent
              id={cardElemKey}
              key={cardElemKey}
              data={itemData}
              width={`${itemWidth}px`}
              height={`${rowHeight - rowGap}px`}
            />
          );
        })}
      </ListRowContainer>
    );
  });
});
