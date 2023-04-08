export type Scale<T extends number | string> = {
  domain?: [number, number];
  codomain?: [number, number];

  pushforward: (values: T[]) => number[];
  pullback: (values: number[]) => T[];
};
