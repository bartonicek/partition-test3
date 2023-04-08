import { Accessor } from "solid-js";
import { SizeHandler } from "../handlers/SizeHandler";
import { Tuple2, XYScale } from "../types";
import { just } from "../utils/funs";
import { ScaleContinuous } from "../scales/ScaleContinuous";
import { ScaleIdentity } from "../scales/ScaleIdentity";

export const makeDefaultScales = (sizeHandler: SizeHandler) => {
  const {
    outerWidth,
    outerHeight,
    innerLeft,
    innerRight,
    innerBottom,
    innerTop,
  } = sizeHandler;

  const scales = {
    outerPct: {} as XYScale,
    innerPct: {} as XYScale,
    outerAbs: {} as XYScale,
    innerAbs: {} as XYScale,
  };

  const pctRange = [just(0), just(1)] as Tuple2<Accessor<number>>;

  scales.outerPct.x = ScaleContinuous.of(pctRange, [just(0), outerWidth]);
  scales.outerPct.y = ScaleContinuous.of(pctRange, [just(0), outerHeight]);
  scales.innerPct.x = ScaleContinuous.of(pctRange, [innerLeft, innerRight]);
  scales.innerPct.y = ScaleContinuous.of(pctRange, [innerBottom, innerTop]);
  scales.outerAbs.x = ScaleIdentity.of();
  scales.outerAbs.y = ScaleIdentity.of();

  return scales;
};
