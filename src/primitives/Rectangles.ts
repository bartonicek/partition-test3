import { Accessor } from "solid-js";
import { globals } from "../globalpars";
import { Options, XYScale } from "../types";
import { withAlpha } from "../utils/graphicfuns";
import { Primitive } from "./Primitive";

export class Rectangles implements Primitive {
  x0: Accessor<number[]>;
  y0: Accessor<number[]>;
  x1: Accessor<number[]>;
  y1: Accessor<number[]>;
  context: CanvasRenderingContext2D;
  scales: XYScale;
  options: Options;

  constructor(
    x0: Accessor<number[]>,
    y0: Accessor<number[]>,
    x1: Accessor<number[]>,
    y1: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: XYScale,
    options?: Partial<Options>
  ) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.context = context;
    this.scales = scales;
    this.options = Object.assign({}, globals, options);
  }

  static of = (
    x0: Accessor<number[]>,
    y0: Accessor<number[]>,
    x1: Accessor<number[]>,
    y1: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: XYScale,
    options?: Partial<Options>
  ) => new Rectangles(x0, y0, x1, y1, context, scales, options);

  draw = () => {
    const { x0, y0, x1, y1, context, scales } = this;
    const { colour, alpha } = this.options;
    const { canvas } = context;

    const [x0p, x1p] = [x0(), x1()].map(scales.x.pushforward);
    const [y0p, y1p] = [y0(), y1()].map(scales.y.pushforward);

    context.save();
    context.fillStyle = withAlpha(alpha)(colour);

    for (let i = 0; i < x0p.length; i++) {
      const [w, h] = [x1p[i] - x0p[i], y1p[i] - y0p[i]];
      context.fillRect(x0p[i], canvas.height - y0p[i], w, -h);
    }

    context.restore();
  };
}
