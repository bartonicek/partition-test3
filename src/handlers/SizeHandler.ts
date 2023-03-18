import { Accessor, createSignal, onMount } from "solid-js";
import { globals } from "../globalpars";
import { GraphicStack } from "../plot/GraphicStack";
import { just, times, toInt } from "../utils/funs";
import { CSS, CSSHeight, CSSWidth } from "../utils/graphicfuns";

export class SizeHandler {
  fontsize: number;
  outerWidth: Accessor<number>;
  outerHeight: Accessor<number>;
  margins: Tuple4<Accessor<number>>;

  constructor(graphicStack: GraphicStack) {
    this.outerWidth = graphicStack.width;
    this.outerHeight = graphicStack.height;
    this.fontsize = globals.fontsize;
    this.margins = globals.margins.map((x) =>
      just(times(this.fontsize)(x))
    ) as Tuple4<Accessor<number>>;
  }

  // margins = () => globals.margins.map(times(this.fontsize)) as Tuple4<number>;

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
