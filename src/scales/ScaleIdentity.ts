import { Scale } from "./Scale";

export class ScaleIdentity implements Scale<number> {
  static of = () => new ScaleIdentity();
  pushforward = (values: number[]) => values;
  pullback = (values: number[]) => values;
}
