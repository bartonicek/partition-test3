import { Accessor, createEffect } from "solid-js";
import { graphicParameters } from "../graphicParameters";
import { Scale } from "../scales/Scale";
import { withAlpha } from "../utils/graphicfuns";
import { Primitive } from "./Primitive";
import { Options } from "../types";

export class Points implements Primitive {
  x: Accessor<number[]>;
  y: Accessor<number[]>;
  scales: { x: Scale<number>; y: Scale<number> };
  options: Options;

  constructor(
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Partial<Options>
  ) {
    this.x = x;
    this.y = y;
    this.scales = scales;
    this.options = Object.assign({}, graphicParameters, options);
  }

  static of = (
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    scales: { x: Scale<number>; y: Scale<number> },
    options?: Partial<Options>
  ) => new Points(x, y, scales, options);

  draw = (context: CanvasRenderingContext2D) => {
    const { x, y } = this;
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
