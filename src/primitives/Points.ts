import { globals } from "../globalpars";
import { Scale } from "../scales/Scale";
import { withAlpha } from "../utils/graphicfuns";
import { Primitive } from "./Primitive";

type Options = {
  colour?: string;
  alpha?: number;
  radius?: number;
};

export class Points implements Primitive {
  x: number[];
  y: number[];
  scales: { x: Scale<number>; y: Scale<number> };

  colour: string;
  alpha: number;
  radius: number;

  constructor(
    x: number[],
    y: number[],
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Options
  ) {
    this.x = x;
    this.y = y;
    this.scales = scales;
    this.colour = options?.colour ?? globals.colour;
    this.alpha = options?.alpha ?? globals.alpha;
    this.radius = options?.radius ?? globals.radius;
  }

  draw = (context: CanvasRenderingContext2D) => {
    const { x, y, colour, alpha, radius } = this;
    const { canvas } = context;

    const xp = this.scales.x.pushforward(x);
    const yp = this.scales.y.pushforward(y);

    context.save();
    context.fillStyle = withAlpha(alpha)(colour);

    for (let i = 0; i < this.x.length; i++) {
      context.beginPath();
      context.arc(xp[i], canvas.height - yp[i], radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  };
}
