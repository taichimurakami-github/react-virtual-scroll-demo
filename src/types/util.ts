type Enumulate<
  Max extends number,
  RangeList extends number[] = []
> = RangeList["length"] extends Max
  ? RangeList[number]
  : Enumulate<Max, [...RangeList, RangeList["length"]]>;

export type Range<Min extends number, Max extends number> =
  | Exclude<Enumulate<Max>, Enumulate<Min>>
  | Max;

export type Replace<T extends {}, K extends keyof T, V> = {
  [P in keyof T]: P extends K ? V : T[P];
};

type MergeImpl<
  Original extends object[],
  Buffer extends number[] = [],
  T = {}
> = Buffer["length"] extends Original["length"]
  ? T
  : MergeImpl<
      Original,
      [...Buffer, Buffer["length"]],
      T & Original[Buffer["length"]]
    >;

export type Merged<T extends object[]> = MergeImpl<T>;
