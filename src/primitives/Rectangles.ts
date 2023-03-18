import { globals } from "../globalpars";
import { Scale } from "../scales/Scale";
import { withAlpha } from "../utils/graphicfuns";
import { Primitive } from "./Primitive";

type Options = {
  colour?: string;
  alpha?: number;
};

export class Rectangles implements Primitive {
  x0: number[];
  y0: number[];
  x1: number[];
  y1: number[];
  scales: { x: Scale<number>; y: Scale<number> };

  colour: string;
  alpha: number;

  constructor(
    x0: number[],
    y0: number[],
    x1: number[],
    y1: number[],
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Options
  ) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.scales = scales;
    this.colour = options?.colour ?? globals.colour;
    this.alpha = options?.alpha ?? globals.alpha;
  }

  static of = (
    x0: number[],
    y0: number[],
    x1: number[],
    y1: number[],
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Options
  ) => new Rectangles(x0, y0, x1, y1, scales, options);

  draw = (context: CanvasRenderingContext2D) => {
    const { x0, y0, x1, y1, scales, colour, alpha } = this;
    const { canvas } = context;

    const x0p = scales.x.pushforward(x0);
    const y0p = scales.y.pushforward(y0);
    const x1p = scales.x.pushforward(x1);
    const y1p = scales.y.pushforward(y1);

    context.save();
    context.fillStyle = withAlpha(alpha)(colour);

    for (let i = 0; i < x0.length; i++) {
      const [w, h] = [x1p[i] - x0p[i], y1p[i] - y0p[i]];
      context.fillRect(x0p[i], canvas.height - y0p[i], w, -h);
    }

    context.restore();
  };
}
