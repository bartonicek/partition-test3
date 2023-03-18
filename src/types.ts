type ReduceFn<T, U> = (result: U, nextValue: T, index: number) => U;
type Reducer<T, U> = {
  tag: string;
  array: T[];
  reducefn: ReduceFn<T, U>;
  initialValue: U;
};

type Tuple2<T> = [T, T];
type Tuple4<T> = [T, T, T, T];
