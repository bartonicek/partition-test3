import { Accessor, createEffect } from "solid-js";
import { Primitive } from "../primitives/Primitive";
import { GraphicStack } from "./GraphicStack";

export class GraphicLayer {
  signals: { width: Accessor<number>; height: Accessor<number> };
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  primitives: Primitive[];

  constructor(
    graphicStack: GraphicStack,
    width: Accessor<number>,
    height: Accessor<number>
  ) {
    this.primitives = [];
    this.signals = { width, height };

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    this.canvas = canvas;
    this.context = context;

    createEffect(() => {
      canvas.width = this.signals.width();
      canvas.height = this.signals.height();
      this.draw();
    });
  }

  static of = (
    graphicStack: GraphicStack,
    width: Accessor<number>,
    height: Accessor<number>
  ) => new GraphicLayer(graphicStack, width, height);

  addPrimitive = (primitive: Primitive) => {
    this.primitives.push(primitive);
    createEffect(() => this.draw());
  };

  draw = () => {
    this.context.clearRect(0, 0, this.signals.width(), this.signals.height());
    this.primitives.forEach((primitive) => primitive.draw());
  };
}
