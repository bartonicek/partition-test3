import { Accessor, createEffect } from "solid-js";
import { Primitive } from "../primitives/Primitive";
import { GraphicStack } from "./GraphicStack";

type GraphicLayerOptions = {
  inner: boolean;
};

export class GraphicLayer {
  width: Accessor<number>;
  height: Accessor<number>;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  primitives: Primitive[];

  constructor(graphicStack: GraphicStack, options: GraphicLayerOptions) {
    this.primitives = [];

    const size = graphicStack.handlers.size;
    this.width = options.inner ? size?.innerWidth : size?.outerWidth;
    this.height = options.inner ? size?.innerHeight : size?.outerHeight;

    const canvas = document.createElement("canvas");
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;

    createEffect(() => {
      canvas.width = this.width();
      canvas.height = this.height();
      this.draw();
    });
  }

  static of = (graphicStack: GraphicStack, options: GraphicLayerOptions) =>
    new GraphicLayer(graphicStack, options);

  addPrimitive = (primitive: Primitive) => {
    this.primitives.push(primitive);
    createEffect(() => this.draw());
  };

  draw = () => {
    this.context.clearRect(0, 0, this.width(), this.height());
    this.primitives.forEach((primitive) => primitive.draw(this.context));
  };
}
