import { Accessor, createSignal, onMount } from "solid-js";
import { graphicParameters } from "../graphicParameters";
import { GraphicStack } from "../plot/GraphicStack";
import { flow, just, times, toInt } from "../utils/funs";
import { Tuple4 } from "../types";

export class SizeHandler {
  outerWidth: Accessor<number>;
  outerHeight: Accessor<number>;
  margins: Tuple4<Accessor<number>>;

  constructor(graphicStack: GraphicStack) {
    this.outerWidth = graphicStack.localSignals.width;
    this.outerHeight = graphicStack.localSignals.height;
    this.margins = graphicParameters.marginLines.map(
      flow(times(graphicParameters.fontsize), just)
    ) as Tuple4<Accessor<number>>;
  }

  innerWidth = () => {
    const { outerWidth, margins } = this;
    return outerWidth() - margins[1]() - margins[3]();
  };

  innerHeight = () => {
    const { outerHeight, margins } = this;
    return outerHeight() - margins[0]() - margins[2]();
  };

  innerLeft = () => this.margins[1]();
  innerRight = () => this.outerWidth() - this.margins[3]();
  innerBottom = () => this.margins[0]();
  innerTop = () => this.outerHeight() - this.margins[2]();
}
