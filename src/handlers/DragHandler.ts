import { Accessor, createEffect } from "solid-js";
import { call } from "../utils/funs";
import { GraphicStack } from "../plot/GraphicStack";

export class DragHandler {
  dragging: boolean;
  start: [Accessor<number>, Accessor<number>];
  end: [Accessor<number>, Accessor<number>];

  constructor(graphicStack: GraphicStack) {
    this.dragging = false;
    this.start = [graphicStack.clickX, graphicStack.clickY];
    this.end = [graphicStack.mouseX, graphicStack.mouseY];
  }
}
