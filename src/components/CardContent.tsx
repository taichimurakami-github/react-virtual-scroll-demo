import classNames from "classnames";
import { CSSProperties } from "react";

export type CardData = {
  id: number | string;
  key: string;
  imgUrl: null | string;
  title: string;
  description: string;
  date: string;
};

type CardContentProps = {
  id: string;
  width: string;
  height: string;
  data: CardData;
  className?: string;
  styles?: CSSProperties;
};

const fallbackImgUrl = "/no-image.svg";

export default function CardContent({
  id,
  data,
  width,
  height,
  styles,
  className,
}: CardContentProps) {
  return (
    <div
      id={id}
      className={classNames(
        "flex p-2 gap-4 shadow-md rounded-lg bg-slate-100",
        className
      )}
      key={data.key}
      style={{
        width,
        height,
        ...styles,
      }}
    >
      <img
        className="w-32"
        src={data.imgUrl ?? fallbackImgUrl}
        alt="dummy card content thumbnail."
      />
      <div className="grid gap-2">
        <p>Content #{data.id}</p>
        <h1 className="text-xl font-bold">{data.title}</h1>
        <p>{data.description}</p>
      </div>
    </div>
  );
}
