import { ScaleContinuous } from "../scales/ScaleContinuous";
import { Primitive } from "./Primitive";

type Options = {
  colour?: string;
  alpha?: number;
  width?: number;
};

export class Line implements Primitive {
  x: number[];
  y: number[];
  scales: { x: ScaleContinuous; y: ScaleContinuous };

  width: number;

  constructor(
    x: number[],
    y: number[],
    scales: { x: ScaleContinuous; y: ScaleContinuous },
    options: Options
  ) {
    this.x = x;
    this.y = y;
    this.scales = scales;
    this.width = options.width ?? 1;
  }

  draw = (context: CanvasRenderingContext2D) => {
    const { x, y, width } = this;
    const { canvas } = context;

    const xp = this.scales.x.pushforward(x);
    const yp = this.scales.y.pushforward(y);

    context.save();
    // context.fillStyle = withAlpha(alpha)(colour);
    context.lineWidth = width;

    context.beginPath();
    context.moveTo(xp[0], canvas.height - yp[0]);
    for (let i = 1; i < this.x.length; i++) {
      context.lineTo(xp[i], canvas.height - yp[i]);
    }
    context.stroke();
    context.restore();
  };
}
