import { Accessor, createEffect } from "solid-js";
import { GraphicStack, XYScale } from "./GraphicStack";
import { globals } from "../globalpars";
import { Primitive } from "../primitives/Primitive";
import { Rectangles } from "../primitives/Rectangles";
import { Line } from "../primitives/Line";

export class GraphicLayer {
  tag: string;
  width: Accessor<number>;
  height: Accessor<number>;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scales: { innerPct: XYScale; outerPct: XYScale };

  primitives: Primitive[];

  constructor(tag: string, graphicStack: GraphicStack) {
    this.tag = tag;
    this.primitives = [];

    const size = graphicStack.handlers.size!;
    this.width = tag === "outer" ? size.outerWidth : size.innerWidth;
    this.height = tag === "outer" ? size.outerHeight : size.innerHeight;

    const canvas = document.createElement("canvas");
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;

    this.scales = graphicStack.scales;
    const margins = size.margins;
    const { innerPct, outerPct } = this.scales;

    if (tag === "outer") {
      const bgOpts = { colour: globals.marginColour };
      const boxOpts = { width: 3 };

      const background = new Rectangles([0], [0], [1], [1], outerPct, bgOpts);
      const box = new Line([0, 0, 1], [1, 0, 0], innerPct, boxOpts);

      this.addPrimitive(background);
      this.addPrimitive(box);
    }

    if (tag === "base") {
      const bgOpts = { colour: globals.backgroundColour };
      const background = new Rectangles([0], [0], [1], [1], outerPct, bgOpts);
      this.addPrimitive(background);
    }

    if (tag != "outer") {
      canvas.style.marginLeft = margins[1]() + "px";
      canvas.style.marginTop = margins[2]() + "px";
    }

    createEffect(() => {
      [canvas.width, canvas.height] = [this.width(), this.height()];
      this.draw();
    });
  }

  static of = (tag: string, graphicStack: GraphicStack) =>
    new GraphicLayer(tag, graphicStack);

  addPrimitive = (primitive: Primitive) => {
    this.primitives.push(primitive);
    this.draw();
  };

  draw = () => {
    this.primitives.forEach((primitive) => primitive.draw(this.context));
  };
}
