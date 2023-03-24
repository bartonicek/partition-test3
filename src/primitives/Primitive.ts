import { Scale } from "../scales/Scale";

export type Primitive = {
  context: CanvasRenderingContext2D;
  scales: { x: Scale<any>; y: Scale<any> };
  draw: () => void;
  x?: () => number[];
  y?: () => number[];
  x0?: () => number[];
  y0?: () => number[];
  x1?: () => number[];
  y1?: () => number[];
};
