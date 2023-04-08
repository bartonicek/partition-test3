import { createSignal } from "solid-js";
import { toInt } from "../utils/funs";
import { CSS } from "../utils/graphicfuns";

export const makeDefaultSignals = (container: HTMLDivElement) => {
  const [width, setWidth] = createSignal(toInt(CSS("width")(container)));
  const [height, setHeight] = createSignal(toInt(CSS("height")(container)));
  const [holding, setHolding] = createSignal(false);
  const [mouseX, setMouseX] = createSignal(0);
  const [mouseY, setMouseY] = createSignal(0);
  const [clickX, setClickX] = createSignal(0);
  const [clickY, setClickY] = createSignal(0);

  return {
    width,
    setWidth,
    height,
    setHeight,
    holding,
    setHolding,
    mouseX,
    setMouseX,
    mouseY,
    setMouseY,
    clickX,
    setClickX,
    clickY,
    setClickY,
  };
};
