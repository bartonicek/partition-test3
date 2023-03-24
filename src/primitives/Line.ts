import { Accessor } from "solid-js";
import { globals } from "../globalpars";
import { ScaleContinuous } from "../scales/ScaleContinuous";
import { Options } from "../types";
import { Primitive } from "./Primitive";
import { withAlpha } from "../utils/graphicfuns";

export class Line implements Primitive {
  x: Accessor<number[]>;
  y: Accessor<number[]>;
  scales: { x: ScaleContinuous; y: ScaleContinuous };
  context: CanvasRenderingContext2D;
  options: Options;

  constructor(
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: { x: ScaleContinuous; y: ScaleContinuous },
    options?: Partial<Options>
  ) {
    this.x = x;
    this.y = y;
    this.scales = scales;
    this.context = context;
    this.options = Object.assign({}, globals, options);
  }

  static of = (
    x: Accessor<number[]>,
    y: Accessor<number[]>,
    context: CanvasRenderingContext2D,
    scales: { x: ScaleContinuous; y: ScaleContinuous },
    options?: Partial<Options>
  ) => new Line(x, y, context, scales, options);

  draw = () => {
    const { x, y, context } = this;
    const { colour, alpha, width } = this.options;
    const { canvas } = context;

    const xp = this.scales.x.pushforward(x());
    const yp = this.scales.y.pushforward(y());

    context.save();
    context.fillStyle = withAlpha(alpha)(colour);
    context.lineWidth = width;

    context.beginPath();
    context.moveTo(xp[0], canvas.height - yp[0]);
    for (let i = 1; i < xp.length; i++) {
      context.lineTo(xp[i], canvas.height - yp[i]);
    }
    context.stroke();
    context.restore();
  };
}
