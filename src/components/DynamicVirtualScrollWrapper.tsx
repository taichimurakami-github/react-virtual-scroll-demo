import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardContent from "./CardContent";
import { VirtualScrollWrapperProps } from "./ScrollerSection";

// Single-column only
// TODO: カラム数にかかわらず使えるように汎用化したい
export default memo(function SpawningScrollWrapper({
  items,
  itemWidth,
  rowHeight,
  rowGap,
}: VirtualScrollWrapperProps) {
  const calcIsInView = useCallback(
    (
      scrollY: number,
      viewportHeight: number,
      targetItemId: number,
      elementHeight: number
    ) => {
      const margin = elementHeight * 2;
      const translateY = targetItemId * rowHeight;

      return (
        scrollY - margin < translateY + elementHeight &&
        translateY < scrollY + viewportHeight + margin
      );
    },
    [rowHeight]
  );

  const nRowsMax = useMemo(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const BUFFER = 3;
    const min = Math.trunc(window.innerHeight / (rowHeight + rowGap)) + 1;
    return min + BUFFER;
  }, [rowGap, rowHeight]);

  const [renderElements, setRenderElements] = useState<number[]>(
    Array(Math.min(nRowsMax, items.length))
      .fill(0)
      .map((_, i) => i)
  );

  const refPtr = useRef({
    first: 0,
    last: nRowsMax - 1,
  });

  const createIncrementalRangeArray = useCallback(
    (first: number, last: number) => {
      const arr = [];
      for (let i = first; i <= last; i++) arr.push(i);
      return arr;
    },
    []
  );

  /**
   * translateYが最も大きい要素から順に，inView状態か否かを見る
   * CAUTION: This function has a side effect. It mutates variable 'tempElementPool'.
   */
  const createNewElementPoolOnScrollUp = useCallback(
    (
      scrollY: number,
      vpHeight: number,
      elementHeight: number
    ): number[] | null => {
      if (refPtr.current.first === 0) {
        // すでに最初の要素が表示されている場合は何もしない
        return null;
      }

      if (calcIsInView(scrollY, vpHeight, refPtr.current.last, elementHeight)) {
        return null;
      }

      return createIncrementalRangeArray(
        --refPtr.current.first,
        --refPtr.current.last
      );
    },
    [calcIsInView, createIncrementalRangeArray]
  );

  // translateYが最も小さい要素から順に，inView状態か否かを見る
  // CAUTION: This function has a side effect. It mutates variable 'tempElementPool'.
  const createNewElementPoolOnScrollDown = useCallback(
    (
      scrollY: number,
      vpHeight: number,
      elementHeight: number
    ): number[] | null => {
      if (refPtr.current.last === items.length - 1) {
        // すでに最後の要素が表示されている場合は何もしない
        return null;
      }

      if (
        calcIsInView(scrollY, vpHeight, refPtr.current.first, elementHeight)
      ) {
        return null;
      }

      return createIncrementalRangeArray(
        ++refPtr.current.first,
        ++refPtr.current.last
      );
    },
    [calcIsInView, createIncrementalRangeArray, items.length]
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
    const elementHeight = rowHeight + rowGap; // card + gap bottom をひとまとめにして考える;
    const scrollY = window.scrollY;
    const vpHeight = window.innerHeight;
    const scrollDirection = calcScrollDirection(scrollY);

    let newRenderElements: number[] | null = null;

    // update Element Pool
    if (scrollDirection === "down") {
      newRenderElements = createNewElementPoolOnScrollDown(
        scrollY,
        vpHeight,
        elementHeight
      );
    } else {
      newRenderElements = createNewElementPoolOnScrollUp(
        scrollY,
        vpHeight,
        elementHeight
      );
    }

    if (newRenderElements) {
      setRenderElements(newRenderElements);
    }
  }, [
    calcScrollDirection,
    createNewElementPoolOnScrollDown,
    createNewElementPoolOnScrollUp,
    rowGap,
    rowHeight,
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
      {renderElements.map((itemId) => {
        const data = items[itemId];
        const translateY = Number(data.id) * (rowHeight + rowGap);
        return (
          <CardContent
            id={data.key}
            key={data.key}
            data={data}
            width={`${itemWidth}px`}
            height={`${rowHeight}px`}
            className="absolute top-0 left-1/2 will-change-transform"
            styles={{
              transform: `translate3d(-50%, ${translateY}px, 0)`,
            }}
          />
        );
      })}
    </>
  );
});
