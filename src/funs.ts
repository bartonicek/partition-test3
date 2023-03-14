export const identity = (x: any) => x;
export const call = (fn: Function) => fn();

export const sum = (x: number, y: number) => x + y;
export const product = (x: number, y: number) => x * y;

export const isEmpty = (object: object) => Object.keys(object).length === 0;
export const toJSON = (x: any) => JSON.stringify(x);
export const fromJSON = (x: any) => JSON.parse(x);

export const match = <T>(array: T[], value: T) =>
  array.flatMap((element, index) => (element === value ? index : []));
export const subset = <T>(array: T[], indices: number[]) =>
  indices.map((i) => array[i]);

export const reduceAt =
  <T, U>(reducefn: ReduceFn<T, U>, indices: number[]): ReduceFn<T, U> =>
  (result: U, nextValue: T, index: number) => {
    if (!indices.includes(index)) return result;
    return reducefn(result, nextValue, index);
  };

export const JSONProduct = (factors: Record<string, any[]>) => {
  const entries = Object.entries(factors);
  return entries[0][1].reduce((result, _, index) => {
    const temp = {} as Record<string, any>;
    for (const [key, values] of entries) temp[key] = values[index];
    result[index] = JSON.stringify(temp);
    return result;
  }, [] as string[]);
};
