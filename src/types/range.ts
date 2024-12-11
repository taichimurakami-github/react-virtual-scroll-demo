
type Enumulate<Max extends number, RangeList extends number[] = []> =
    RangeList['length'] extends Max
    ? RangeList[number]
    : Enumulate<Max, [...RangeList, RangeList['length']]>;


export type Range<Min extends number, Max extends number> = Exclude<Enumulate<Max>, Enumulate<Min>> | Max;
