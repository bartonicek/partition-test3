import { Accessor, createSignal, onMount } from "solid-js";
import { just, throttle, toInt } from "../utils/funs";
import { CSS, CSSHeight, CSSWidth, CSSWidthHeight } from "../utils/graphicfuns";
import { GraphicLayer } from "./GraphicLayer";
import { SizeHandler } from "../handlers/SizeHandler";
import { Scale } from "../scales/Scale";
import { ScaleContinuous } from "../scales/ScaleContinuous";

export type XYScale = { x: ScaleContinuous; y: ScaleContinuous };

export class GraphicStack {
  app: HTMLDivElement;
  container: HTMLDivElement;
  layers: { [key: string]: GraphicLayer };
  width: Accessor<number>;
  height: Accessor<number>;
  handlers: { size?: SizeHandler; [key: string]: any };
  scales: {
    outerPct: XYScale;
    innerPct: XYScale;
    [key: string]: Record<string, Scale<any>>;
  };

  constructor(app: HTMLDivElement) {
    this.app = app;
    this.handlers = {};

    const container = document.createElement("div");
    container.classList.add("plotscape-container");
    this.container = container;
    this.app.appendChild(container);

    const [width, setWidth] = createSignal(toInt(CSS("width")(container)));
    const [height, setHeight] = createSignal(toInt(CSS("height")(container)));
    this.width = width;
    this.height = height;

    const resize = () => {
      setWidth(toInt(CSS("width")(container)));
      setHeight(toInt(CSS("height")(container)));
    };

    onMount(() => window.addEventListener("resize", throttle(50)(resize)));
    this.handlers.size = new SizeHandler(this);

    const { innerLeft, innerRight, innerBottom, innerTop } = this.handlers.size;
    const scales = { outerPct: {} as XYScale, innerPct: {} as XYScale };
    const pctRange = [just(0), just(1)] as Tuple2<Accessor<number>>;
    scales.outerPct.x = ScaleContinuous.of(pctRange, [just(0), width]);
    scales.outerPct.y = ScaleContinuous.of(pctRange, [just(0), height]);
    scales.innerPct.x = ScaleContinuous.of(pctRange, [innerLeft, innerRight]);
    scales.innerPct.y = ScaleContinuous.of(pctRange, [innerBottom, innerTop]);
    this.scales = scales;

    this.layers = {};
    const layerNames = ["outer", "base", "user", "highlight"];
    layerNames.forEach((name) => {
      this.layers[name] = GraphicLayer.of(name, this);
      this.container.appendChild(this.layers[name].canvas);
    });
  }
}
