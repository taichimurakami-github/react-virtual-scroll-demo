"use client";
import { useCallback, useMemo, useState } from "react";
import StaticVirtualScrollWrapper from "./StaticVirtualScrollWrapper";
import DynamicVirtualScrollWrapper from "./DynamicVirtualScrollWrapper";
import { dummyDataList, getDummyData } from "../dummyData";
import { CardData } from "./presentational/CardContent";

type Mode = "static" | "dynamic";
type ScrollerSectionProps = {
  itemLength?: number;
};

export type VirtualScrollWrapperCommonProps = {
  items: CardData[];
  className?: string;
  rowHeight: number;
  itemWidth: number;
  rowGap: number;
  colGap?: number;
  initScrollY?: number;
  nColumns?: number;
  rowBuffer?: number;
};

const itemWidth = 700;
const rowHeight = 200;
const rowGap = 16;
const nColumns = 2;
const LS_KEY_MODE = "LS_KEY_MODE";

export const InfiniteScrollerSection = ({
  itemLength = 50,
}: ScrollerSectionProps) => {
  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem(LS_KEY_MODE) as Mode) ?? "static"
  );
  const dummyItems = useMemo(() => {
    return Array(itemLength)
      .fill(null)
      .map((_, i) => {
        return {
          ...getDummyData(i % dummyDataList.length, i),
          id: i,
          key: `dummy_card_content_${i}`,
        };
      });
  }, [itemLength]);

  return (
    <>
      <button
        className="fixed top-2 left-2 p-2 flex justfy-center items-center bg-black rounded-md text-white font-bold"
        onClick={useCallback(() => {
          setMode((mode) => {
            const nextMode = mode === "static" ? "dynamic" : "static";
            localStorage.setItem(LS_KEY_MODE, nextMode);
            return nextMode;
          });
        }, [])}
      >
        Active mode: {mode} <br />
        (Click to change)
      </button>

      <div
        id="virtual_scroll_wrapper"
        className="relative"
        style={{
          width: `${itemWidth}px`,
          height: `${dummyItems.length * (rowHeight + rowGap)}px`,
        }}
      >
        {mode === "static" ? (
          <StaticVirtualScrollWrapper
            items={dummyItems}
            itemWidth={itemWidth}
            rowHeight={rowHeight}
            rowGap={rowGap}
            nColumns={nColumns}
          />
        ) : (
          <DynamicVirtualScrollWrapper
            items={dummyItems}
            itemWidth={itemWidth}
            rowHeight={rowHeight}
            rowGap={rowGap}
            nColumns={nColumns}
          />
        )}
      </div>
    </>
  );
};
