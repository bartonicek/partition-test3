export class Dict<T> {
  value: Record<string, T>;

  constructor(value: Record<string, T>) {
    this.value = value;
  }

  static of = <T>(value: Record<string, T>) => new Dict(value);

  map = <U>(mapfn: (value: T) => U) => {
    const result = {} as Record<string, U>;
    for (const [key, value] of Object.entries(this.value))
      result[key] = mapfn(value);
    return Dict.of(result);
  };

  flush = <U>(flushfn: (value: Record<string, T>) => U) => flushfn(this.value);
}
