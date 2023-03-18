export type Scale<T extends number | string> = {
  domain: [number, number];
  codomain: [number, number];

  pushforward: (value: T[]) => number[];
  pullback: (value: number[]) => T[];
};
