import { memo } from "react";
import CardContent from "./presentational/CardContent";
import { VirtualScrollWrapperCommonProps } from "./InfiniteScrollerSection";
import useInfiniteScrollRenderContext from "../hooks/useInfiniteScrollRenderContext";
import ListRowContainer from "./presentational/ListRowContainer";

/**
 * DOMの生成・破棄をベースに再レンダリングを実行する実装の無限スクロール
 */
export default memo(function DynamicVirtualScrollWrapper({
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

  return renderContext.map(({ rowId, uid, itemIdList, translateY }, index) => {
    const rowElemKey = `dynamic-dummy_card_content_row-${rowId}-${index}`; // rowIdとindexを利用することで，再利用せずに都度DOMを生成・破棄させる
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
          const cardElemKey = `dynamic-dummy_card_content_card-${
            itemId === null ? `${rowId ?? index}-${iColumn}` : itemId
          }`; // columnの位置が同じだったら使いまわす
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
