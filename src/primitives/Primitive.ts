import { Scale } from "../scales/Scale";

export type Primitive = {
  scales: { x: Scale<any>; y: Scale<any> };
  draw: (context: CanvasRenderingContext2D) => void;
  x?: number[];
  y?: number[];
};
