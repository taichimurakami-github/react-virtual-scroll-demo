import { PropsWithChildren } from "react";

export interface ListRowContainerProps {
  id?: string;
  colGap: number;
  translateY: number;
  active?: boolean;
}

const Z_INDEX_ACTIVE = undefined;
const Z_INDEX_INACTIVE = -100;

export default function ListRowContainer({
  id,
  children,
  colGap,
  translateY,
  active = true,
}: PropsWithChildren<ListRowContainerProps>) {
  return (
    <div
      id={id}
      className="absolute flex items-center top-0 left-1/2 will-change-transform w-full"
      style={{
        gap: `${colGap}px`,
        transform: `translate3d(-50%, ${translateY}px, 0)`,
        visibility: active ? "visible" : "hidden", // inactive状態でも要素を保持してメモ化
        zIndex: active ? Z_INDEX_ACTIVE : Z_INDEX_INACTIVE,
      }}
    >
      {children}
    </div>
  );
}
