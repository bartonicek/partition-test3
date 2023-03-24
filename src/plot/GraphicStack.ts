import { Accessor, createEffect, createSignal, onMount } from "solid-js";
import { globals } from "../globalpars";
import { DragHandler } from "../handlers/DragHandler";
import { SizeHandler } from "../handlers/SizeHandler";
import { Line } from "../primitives/Line";
import { Rectangles } from "../primitives/Rectangles";
import { Scale } from "../scales/Scale";
import { ScaleContinuous } from "../scales/ScaleContinuous";
import { Tuple2, XYScale } from "../types";
import { just, throttle, toInt, unitSquare, wrap } from "../utils/funs";
import { CSS } from "../utils/graphicfuns";
import { GraphicLayer } from "./GraphicLayer";

export class GraphicStack {
  app: HTMLDivElement;
  container: HTMLDivElement;
  layers: { [key: string]: GraphicLayer };
  signals: {
    width: Accessor<number>;
    height: Accessor<number>;
    clickX: Accessor<number>;
    clickY: Accessor<number>;
    mouseX: Accessor<number>;
    mouseY: Accessor<number>;
  };
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
    const [holding, setHolding] = createSignal(false);
    const [mouseX, setMouseX] = createSignal(0);
    const [mouseY, setMouseY] = createSignal(0);
    const [clickX, setClickX] = createSignal(0);
    const [clickY, setClickY] = createSignal(0);

    this.signals = { width, height, clickX, clickY, mouseX, mouseY };
    const size = new SizeHandler(this);
    this.handlers.size = size;
    this.handlers.drag = new DragHandler(this);

    const onResize = () => {
      setWidth(toInt(CSS("width")(container)));
      setHeight(toInt(CSS("height")(container)));
    };

    const onMousedown = (event: MouseEvent) => {
      const [x, y] = [event.offsetX, size!.innerHeight() - event.offsetY];
      setHolding(true);
      setClickX(x), setClickY(y), setMouseX(x), setMouseY(y);
    };
    const onMouseup = () => setHolding(false);
    const onMousemove = (event: MouseEvent) => {
      if (!holding()) return;
      const [x, y] = [event.offsetX, size!.innerHeight() - event.offsetY];
      setMouseX(x), setMouseY(y);
    };

    container.addEventListener("mousedown", (event) =>
      console.log(event.offsetX)
    );

    onMount(() => {
      window.addEventListener("resize", throttle(50)(onResize));
      container.addEventListener("mousemove", throttle(50)(onMousemove));
      container.addEventListener("mousedown", onMousedown);
      container.addEventListener("mouseup", onMouseup);
    });

    const {
      innerLeft,
      innerRight,
      innerBottom,
      innerTop,
      outerWidth,
      outerHeight,
    } = this.handlers.size;

    const scales = {
      outerPct: {} as XYScale,
      innerPct: {} as XYScale,
      outerAbs: {} as XYScale,
      innerAbs: {} as XYScale,
    };
    const pctRange = [just(0), just(1)] as Tuple2<Accessor<number>>;
    scales.outerPct.x = ScaleContinuous.of(pctRange, [just(0), width]);
    scales.outerPct.y = ScaleContinuous.of(pctRange, [just(0), height]);
    scales.innerPct.x = ScaleContinuous.of(pctRange, [innerLeft, innerRight]);
    scales.innerPct.y = ScaleContinuous.of(pctRange, [innerBottom, innerTop]);
    scales.outerAbs.x = ScaleContinuous.of(
      [just(0), outerWidth],
      [just(0), outerWidth]
    );
    scales.outerAbs.y = ScaleContinuous.of(
      [just(0), outerHeight],
      [just(0), outerHeight]
    );
    // scales.innerAbs.x = ScaleContinuous.of(
    //   [innerLeft, innerRight],
    //   [innerLeft, innerRight]
    // );
    // scales.innerAbs.y = ScaleContinuous.of(
    //   [innerTop, innerBottom],
    //   [innerTop, innerBottom]
    // );
    this.scales = scales;

    this.layers = {};
    const layerNames = ["outer", "base", "user", "highlight", "over"];
    const [under, base, user, highlight, over] = layerNames.map((name) => {
      const [width, height] = ["outer", "over"].includes(name)
        ? [size.outerWidth, size.outerHeight]
        : [size.innerWidth, size.innerHeight];
      const layer = GraphicLayer.of(this, width, height);
      this.container.appendChild(layer.canvas);
      this.layers[name] = layer;
      return layer;
    });

    const { margins } = this.handlers.size;
    [base, user, highlight].forEach((layer) => {
      layer.canvas.style.marginLeft = margins[1]() + "px";
      layer.canvas.style.marginTop = margins[2]() + "px";
    });

    const marginRect = Rectangles.of(
      ...unitSquare(),
      under.context,
      scales.outerPct,
      { colour: globals.marginColour }
    );
    const boxLine = Line.of(
      just([0, 0, 1]),
      just([1, 0, 0]),
      under.context,
      scales.innerPct,
      { width: 3 }
    );
    const backgroundRect = Rectangles.of(
      ...unitSquare(),
      base.context,
      scales.outerPct,
      { colour: globals.backgroundColour }
    );

    const dragRect = Rectangles.of(
      () => [clickX() - margins[1]()],
      () => [clickY() + margins[2]()],
      () => [mouseX() - margins[1]()],
      () => [mouseY() + margins[2]()],
      user.context,
      scales.outerAbs,
      { colour: "#000000", alpha: 0.1 }
    );

    under.addPrimitive(marginRect);
    under.addPrimitive(boxLine);
    base.addPrimitive(backgroundRect);
    user.addPrimitive(dragRect);
  }
}
