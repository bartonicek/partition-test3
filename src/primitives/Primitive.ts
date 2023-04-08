import { Accessor } from "solid-js";
import { Scale } from "../scales/Scale";

export type Primitive = {
  scales: { x: Scale<any>; y: Scale<any> };
  draw: (context: CanvasRenderingContext2D) => void;
  x?: Accessor<number[]>;
  y?: Accessor<number[]>;
  x0?: Accessor<number[]>;
  y0?: Accessor<number[]>;
  x1?: Accessor<number[]>;
  y1?: Accessor<number[]>;
};
