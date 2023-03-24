import { ReduceFn } from "../types";

export const identity = (x: any) => x;
export const call = (fn: Function) => fn();
export const just =
  <T>(x: T) =>
  () =>
    x;
export const wrap = <T>(x: T) => [x];
export const flow =
  (...funs: ((x: any) => any)[]) =>
  (x: any) =>
    funs.reduce((a, b) => b(a), x);

export const unique = (array: any[]) => Array.from(new Set(array));

export const times = (y: number) => (x: number) => y * x;
export const sum = (x: number, y: number) => x + y;
export const product = (x: number, y: number) => x * y;

export const isEmpty = (object: object) => Object.keys(object).length === 0;
export const toJSON = (x: any) => JSON.stringify(x);
export const fromJSON = (x: any) => JSON.parse(x);

export const match = <T>(array: T[], value: T) =>
  array.flatMap((element, index) => (element === value ? index : []));
export const subset = <T>(array: T[], indices: number[]) =>
  indices.map((i) => array[i]);

export const throttle = (delay: number) => (fun: Function) => {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    lastTime = now;
    fun(...args);
  };
};

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

export const unitSquare = () =>
  [just([0]), just([0]), just([1]), just([1])] as const;

export const toInt = (x: string) => parseInt(x, 10);
