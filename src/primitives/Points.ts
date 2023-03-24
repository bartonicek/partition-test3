import { Accessor, createEffect } from "solid-js";
import { globals } from "../globalpars";
import { Scale } from "../scales/Scale";
import { withAlpha } from "../utils/graphicfuns";
import { Primitive } from "./Primitive";
import { Options } from "../types";

export class Points implements Primitive {
  x: Accessor<number[]>;
  y: Accessor<number[]>;
  context: CanvasRenderingContext2D;
  scales: { x: Scale<number>; y: Scale<number> };
  options: Options;

  constructor(
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Partial<Options>
  ) {
    this.x = x;
    this.y = y;
    this.context = context;
    this.scales = scales;
    this.options = Object.assign({}, globals, options);
  }

  static of = (
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Partial<Options>
  ) => new Points(x, y, context, scales, options);

  draw = () => {
    const { x, y, context } = this;
    const { colour, alpha, radius } = this.options;
    const { canvas } = context;

    const xp = this.scales.x.pushforward(x());
    const yp = this.scales.y.pushforward(y());

    context.save();
    context.fillStyle = withAlpha(alpha)(colour);

    for (let i = 0; i < xp.length; i++) {
      context.beginPath();
      context.arc(xp[i], canvas.height - yp[i], radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  };
}
