type ReduceFn<T, U> = (result: U, nextValue: T) => U;
type Reducer<T, U> = {
  tag: string;
  array: T[];
  reducefn: ReduceFn<T, U>;
  initialValue: U;
};
