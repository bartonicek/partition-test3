import { ScaleContinuous } from "./scales/ScaleContinuous";

export type ReduceFn<T, U> = (result: U, nextValue: T, index: number) => U;
export type Reducer<T, U> = {
  tag: string;
  array: T[];
  reducefn: ReduceFn<T, U>;
  initialValue: U;
};

export type Tuple2<T> = [T, T];
export type Tuple4<T> = [T, T, T, T];

export type XYScale = { x: ScaleContinuous; y: ScaleContinuous };

export type Options = {
  colour: string;
  alpha: number;
  radius: number;
  width: number;
};
