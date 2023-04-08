import { onMount } from "solid-js";
import { graphicParameters } from "../graphicParameters";
import { DragHandler } from "../handlers/DragHandler";
import { SizeHandler } from "../handlers/SizeHandler";
import { Line } from "../primitives/Line";
import { Rectangles } from "../primitives/Rectangles";
import { Scale } from "../scales/Scale";
import { Tuple2, XYScale } from "../types";
import { just, throttle, toInt, unitSquare } from "../utils/funs";
import { CSS } from "../utils/graphicfuns";
import { GraphicLayer } from "./GraphicLayer";
import { makeDefaultSignals } from "./makeDefaultSignals";
import { makeDefaultScales } from "./makeDefaultScales";

export class GraphicStack {
  app: HTMLDivElement;
  container: HTMLDivElement;
  layers: { [key: string]: GraphicLayer };
  localSignals: { [key: string]: any };
  handlers: { size: SizeHandler; [key: string]: any };
  scales: {
    outerPct: XYScale;
    innerPct: XYScale;
    [key: string]: Record<string, Scale<any>>;
  };

  constructor(app: HTMLDivElement) {
    this.app = app;

    const container = document.createElement("div");
    container.classList.add("plotscape-container");
    this.container = container;
    this.app.appendChild(container);

    const localSignals = makeDefaultSignals(container);
    this.localSignals = localSignals;

    const sizeHandler = new SizeHandler(this);
    this.handlers = { size: sizeHandler, drag: new DragHandler(this) };
    const { innerHeight } = sizeHandler;

    const scales = makeDefaultScales(sizeHandler);
    this.scales = scales;

    const onResize = () => {
      localSignals.setWidth(toInt(CSS("width")(container)));
      localSignals.setHeight(toInt(CSS("height")(container)));
    };

    const onMousedown = (event: MouseEvent) => {
      const [x, y] = [event.offsetX, innerHeight() - event.offsetY];
      localSignals.setHolding(true);
      localSignals.setClickX(x);
      localSignals.setClickY(y);
      localSignals.setMouseX(x);
      localSignals.setMouseY(y);
    };

    const onMouseup = () => localSignals.setHolding(false);
    const onMousemove = (event: MouseEvent) => {
      if (!localSignals.holding()) return;
      const [x, y] = [event.offsetX, innerHeight() - event.offsetY];
      localSignals.setMouseX(x), localSignals.setMouseY(y);
    };

    onMount(() => {
      window.addEventListener("resize", throttle(50)(onResize));
      container.addEventListener("mousemove", throttle(50)(onMousemove));
      container.addEventListener("mousedown", onMousedown);
      container.addEventListener("mouseup", onMouseup);
    });

    this.layers = {};
    const layerNames = ["under", "base", "user", "highlight", "over"];
    const [under, base, user, highlight, over] = layerNames.map((name) => {
      const inner = !["over", "under"].includes(name);
      const layer = GraphicLayer.of(this, { inner });
      this.container.appendChild(layer.canvas);
      this.layers[name] = layer;
      return layer;
    });

    const { margins } = sizeHandler;
    [base, user, highlight].forEach((layer) => {
      layer.canvas.style.marginLeft = margins[1]() + "px";
      layer.canvas.style.marginTop = margins[2]() + "px";
    });

    const marginRect = Rectangles.of(...unitSquare(), scales.outerPct, {
      colour: graphicParameters.marginColour,
    });
    const boxLine = Line.of(just([0, 0, 1]), just([1, 0, 0]), scales.innerPct, {
      width: 2,
    });
    const backgroundRect = Rectangles.of(...unitSquare(), scales.outerPct, {
      colour: graphicParameters.backgroundColour,
    });

    const dragRect = Rectangles.of(
      () => [localSignals.clickX() - margins[1]()],
      () => [localSignals.clickY() + margins[2]()],
      () => [localSignals.mouseX() - margins[1]()],
      () => [localSignals.mouseY() + margins[2]()],
      scales.outerAbs,
      { colour: "#000000", alpha: 0.1 }
    );

    under.addPrimitive(marginRect);
    over.addPrimitive(boxLine);
    base.addPrimitive(backgroundRect);
    user.addPrimitive(dragRect);
  }
}
