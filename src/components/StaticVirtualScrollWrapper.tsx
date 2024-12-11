import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardContent from "./CardContent";
import { VirtualScrollWrapperProps } from "./ScrollerSection";

type DoublyLinkedList = {
  id: number;
  prev: number | null;
  next: number | null;
}[];

type ElementPool = ({
  itemId: number;
  translateY: number;
} & DoublyLinkedList[number])[];

// Single-column only
// TODO: カラム数にかかわらず使えるように汎用化したい
export default memo(function StaticVirtualScrollWrapper({
  items,
  itemGap,
  itemWidth,
  itemHeight,
}: VirtualScrollWrapperProps) {
  const nRowsMax = useMemo(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const BUFFER = 3;
    const min = Math.trunc(window.innerHeight / (itemHeight + itemGap)) + 1;
    return min + BUFFER;
  }, [itemGap, itemHeight]);

  const calcIsInView = useCallback(
    (
      scrollY: number,
      viewportHeight: number,
      translateY: number,
      elementHeight: number
    ) => {
      const margin = elementHeight * 2;
      // const viewportTop = scrollY - margin;
      // const viewportBottom = scrollY + viewportHeight + margin;

      return (
        scrollY - margin < translateY + elementHeight &&
        translateY < scrollY + viewportHeight + margin
      );
    },
    []
  );

  const [elementPool, setElementPool] = useState<ElementPool>(
    Array(nRowsMax)
      .fill(0)
      .map((_, i) => {
        return {
          id: i, // Poolで一意に固定
          itemId: i, // 組み替え時に変動
          translateY: i * (itemHeight + itemGap),
          prev: i === 0 ? null : i - 1,
          next: i === nRowsMax - 1 ? null : i + 1,
        };
      })
  );
  const refPtr = useRef({
    hasFirstItem: 0, // hasFirstItem = elementPoolの最初
    hasLastItem: nRowsMax - 1, // hasLastItem = elementPoolの最後
  });

  /**
   * translateYが最も大きい要素から順に，inView状態か否かを見る
   * CAUTION: This function has a side effect. It mutates variable 'tempElementPool'.
   */
  const createNewElementPoolOnScrollUp = useCallback(
    (
      tempElementPool: ElementPool,
      scrollY: number,
      vpHeight: number,
      elementHeight: number
    ): ElementPool => {
      if (
        calcIsInView(
          scrollY,
          vpHeight,
          elementPool[refPtr.current.hasLastItem].translateY,
          elementHeight
        )
      ) {
        return tempElementPool;
      }

      const pool = tempElementPool;
      const firstEl = pool[refPtr.current.hasFirstItem];
      const lastEl = pool[refPtr.current.hasLastItem];

      // Assert
      if (firstEl.next == null) {
        throw new Error("Next element of first elem must not be null");
      }
      if (lastEl.prev == null) {
        throw new Error("Last element of last elem must not be null");
      }

      if (firstEl.itemId === 0) {
        // すでに最初のアイテムを表示済みの場合はなにもしない
        return tempElementPool;
      }

      /**
       * Exchange element
       */

      // 最後から2番目の要素が最後の要素になる
      refPtr.current.hasLastItem = pool[lastEl.prev].id;
      pool[lastEl.prev].next = null;

      // 先頭の要素は２番目になる
      firstEl.prev = lastEl.id;

      // 最後の要素は先頭に来る
      refPtr.current.hasFirstItem = lastEl.id;
      lastEl.prev = null;
      lastEl.next = firstEl.next;
      lastEl.translateY = firstEl.translateY - elementHeight; // style更新 (上端の見切れたアイテムを下端まで持ってくる)
      lastEl.itemId = firstEl.itemId - 1; // itemId更新

      return tempElementPool;

      // in viewな要素が見つかるまで繰り返す (スクロールの粒度的に，１つ以上の要素を飛ばす可能性がある場合のみ再帰が必要)
      // return createNewElementPoolOnScrollUp(
      //   tempElementPool,
      //   scrollY,
      //   vpHeight,
      //   elementHeight
      // );
    },
    [calcIsInView, elementPool]
  );

  // translateYが最も小さい要素から順に，inView状態か否かを見る
  // CAUTION: This function has a side effect. It mutates variable 'tempElementPool'.
  const createNewElementPoolOnScrollDown = useCallback(
    (
      tempElementPool: ElementPool,
      scrollY: number,
      vpHeight: number,
      elementHeight: number
    ): ElementPool => {
      if (
        calcIsInView(
          scrollY,
          vpHeight,
          elementPool[refPtr.current.hasFirstItem].translateY,
          elementHeight
        )
      ) {
        return tempElementPool;
      }

      const pool = tempElementPool;
      const firstEl = pool[refPtr.current.hasFirstItem];
      const lastEl = pool[refPtr.current.hasLastItem];

      // Assert
      if (firstEl.next == null) {
        throw new Error("Next element of first elem must not be null");
      }
      if (lastEl.prev == null) {
        throw new Error("Last element of last elem must not be null");
      }

      if (lastEl.itemId === items.length - 1) {
        // すでに最後のアイテムを表示済みの場合はなにもしない
        return tempElementPool;
      }

      /**
       * Exchange element
       */

      // 2番目の要素が最初の要素になる
      refPtr.current.hasFirstItem = pool[firstEl.next].id;
      pool[firstEl.next].prev = null;

      // 最後尾の要素は最後から２番目になる
      lastEl.next = firstEl.id;

      // 最初の要素は最後尾に来る
      refPtr.current.hasLastItem = firstEl.id;
      firstEl.prev = lastEl.id;
      firstEl.next = null;
      firstEl.translateY = lastEl.translateY + elementHeight; // style更新 (上端の見切れたアイテムを下端まで持ってくる)
      firstEl.itemId = lastEl.itemId + 1; // itemId更新

      return tempElementPool;

      // in viewな要素が見つかるまで繰り返す(スクロールの粒度的に，１つ以上の要素を飛ばす可能性がある場合のみ再帰が必要)
      // return createNewElementPoolOnScrollDown(
      //   tempElementPool,
      //   scrollY,
      //   vpHeight,
      //   elementHeight
      // );
    },
    [calcIsInView, elementPool, items.length]
  );

  const refPrevScrollY = useRef(0);
  const calcScrollDirection = useCallback(
    (currentScrollY: number): "up" | "down" => {
      if (refPrevScrollY.current < currentScrollY) {
        refPrevScrollY.current = currentScrollY;
        return "down";
      } else {
        refPrevScrollY.current = currentScrollY;
        return "up";
      }
    },
    []
  );

  const updateContents = useCallback(() => {
    const elementHeight = itemHeight + itemGap; // card + gap bottom をひとまとめにして考える;
    const scrollY = window.scrollY;
    const vpHeight = window.innerHeight;
    const scrollDirection = calcScrollDirection(scrollY);

    // update Element Pool
    const newElementPool = [...elementPool];

    if (scrollDirection === "down") {
      createNewElementPoolOnScrollDown(
        newElementPool,
        scrollY,
        vpHeight,
        elementHeight
      );
    } else {
      createNewElementPoolOnScrollUp(
        newElementPool,
        scrollY,
        vpHeight,
        elementHeight
      );
    }

    setElementPool(newElementPool);
  }, [
    calcScrollDirection,
    createNewElementPoolOnScrollDown,
    createNewElementPoolOnScrollUp,
    elementPool,
    itemGap,
    itemHeight,
  ]);

  const refTicking = useRef(false);
  const handleScroll = useCallback(
    (handler: (e: Event) => void) => (e: Event) => {
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
    const onScrollHandler = handleScroll(updateContents);
    document.addEventListener("scroll", onScrollHandler);
    return () => document.removeEventListener("scroll", onScrollHandler);
  }, [updateContents, handleScroll]);

  return (
    <>
      {elementPool.map((v) => {
        const data = items[v.itemId];
        const key = `static-dummy_card_content_${v.id}`;
        return (
          <CardContent
            id={key}
            key={key}
            data={data}
            width={`${itemWidth}px`}
            height={`${itemHeight}px`}
            className="absolute top-0 left-1/2 will-change-transform"
            styles={{
              transform: `translate3d(-50%, ${v.translateY}px, 0)`,
            }}
          />
        );
      })}
    </>
  );
});
