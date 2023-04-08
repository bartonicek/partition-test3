import { ScaleContinuous } from "./scales/ScaleContinuous";
import { ScaleIdentity } from "./scales/ScaleIdentity";

export type ReduceFn<T, U> = (result: U, nextValue: T, index: number) => U;
export type Reducer<T, U> = {
  array: T[];
  reducefn: ReduceFn<T, U>;
  initalValue: U;
};

export type Tuple2<T> = [T, T];
export type Tuple4<T> = [T, T, T, T];

export type XYScale = {
  x: ScaleContinuous | ScaleIdentity;
  y: ScaleContinuous | ScaleIdentity;
};

export type Options = {
  colour: string;
  alpha: number;
  radius: number;
  width: number;
};
