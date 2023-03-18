import { ScaleContinuous } from "./ScaleContinuous";

export class ScaleProportion {
  constructor(codomain: [number, number], expand?: [number, number]) {
    return new ScaleContinuous([0, 1], codomain, expand);
  }
}
