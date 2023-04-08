import { Accessor, createEffect, createRoot, createSignal } from "solid-js";
import { GraphicStack } from "./plot/GraphicStack";
import { Points } from "./primitives/Points";
import "./styles.css";
import {
  flow,
  intToChar,
  just,
  product,
  reduceAt,
  seq,
  sum,
  tagKeys,
  unique,
  wrap,
} from "./utils/funs";
import { ScaleContinuous } from "./scales/ScaleContinuous";
import { Partition } from "./partition/Partition";
import { Factor } from "./partition/Factor";
import { Partition2 } from "./partition/Partition2";
import h from "solid-js/h";
import { ReduceFn, Reducer } from "./types";

const app = document.querySelector("#app") as HTMLDivElement;
app.classList.add("plotscape-scene");

const group = ["A", "B", "B", "C", "B", "A", "B"];
const gender = ["M", "M", "M", "M", "F", "F", "F"];
const marker = [1, 2, 3, 1, 2, 3, 1];
const arr1 = [1.1, 1.2, 1.1, 1.3, 1.4, 1.2, 1.1];

const loadJSON = async (path: string) => {
  const response = await fetch(path);
  return await response.json();
};

const dataMtcars = await loadJSON("./src/data/mtcars.json");

const [groupS, setGroupS] = createSignal(dataMtcars.am);
const [genderS, setGenderS] = createSignal(dataMtcars.vs);
const [markerS, setmarkerS] = createSignal(dataMtcars.cyl);

const data1 = { gender: genderS, group: groupS };
const data2 = { marker: markerS };

// const partition0 = Partition.of({});
// const partition1 = partition0.nest(data1);
// const partition2 = partition1.nest(data2);

// partition2.addReducer({
//   tag: "arr1Sum",
//   array: dataMtcars.mpg,
//   reducefn: sum,
//   initialValue: 0,
// });

// partition2.addReducer({
//   tag: "arr1Product",
//   array: dataMtcars.mpg,
//   reducefn: product,
//   initialValue: 1,
// });

createRoot(() => {
  const stack1 = new GraphicStack(app);

  const randomArr = () => Array.from(Array(100), () => Math.random());

  const xx = dataMtcars.wt;
  const yy = dataMtcars.mpg;
  const [x, setX] = createSignal(xx);
  const [y, setY] = createSignal(yy);

  const { highlight, under } = stack1.layers;

  const scales = {
    x: ScaleContinuous.of(
      [just(Math.min(...xx)), just(Math.max(...xx))],
      [just(0), highlight.width],
      [just(0.1), just(0.1)]
    ),
    y: ScaleContinuous.of(
      [just(Math.min(...yy)), just(Math.max(...yy))],
      [just(0), highlight.height],
      [just(0.1), just(0.1)]
    ),
  };

  const points1 = new Points(
    just([0, 0.1, 0.2, 0.3]),
    just([-0.05, -0.05, -0.05, -0.05]),
    stack1.scales.innerPct
  );

  const points2 = new Points(x, y, scales, {
    colour: "coral",
  });

  under.addPrimitive(points1);
  highlight.addPrimitive(points2);

  document.body.addEventListener("click", () => {
    setX((value) => value.map((e) => e + 0.1 * (Math.random() - 0.5)));
    setY((value) => value.map((e) => e + 0.1 * (Math.random() - 0.5)));
  });
});

const { vs, am, cyl, mpg } = dataMtcars;

const factor1 = Factor.from({ vs });
const factor2 = Factor.from({ am });
const factor3 = Factor.from({ cyl });

const product1 = Factor.product(factor1, factor2);
const product2 = Factor.product(product1, factor3);

const partition0 = new Partition2();
const partition1 = partition0.nest(() => product1);
const partition2 = partition1.nest(() => factor3);

partition2.addReducer({
  tag: "sum",
  reducefn: sum,
  initialValue: 0,
  array: mpg,
});

// const x = () => partition2.parts().map((x) => x.labels());

// createEffect(() => console.log(x()));

class Part {
  parent?: Part;
  depth: number;
  indices: number[];
  staticLabels: Record<string, any>;
  reducers: Record<string, Reducer<any, any>>;

  constructor(
    indices: number[],
    staticLabels: Record<string, any>,
    reducers: Record<string, Reducer<any, any>>,
    parent?: Part
  ) {
    this.parent = parent;
    this.depth = (parent?.depth ?? -1) + 1;
    this.indices = indices;
    this.staticLabels = staticLabels;
    this.reducers = reducers;
  }

  static of = (
    indices: number[],
    staticLabels: Record<string, any>,
    reducers: Record<string, Reducer<any, any>>,
    parent?: Part
  ) => new Part(indices, staticLabels, reducers, parent);

  addReducer = <T, U>(key: string, reducer: Reducer<T, U>) => {
    this.parent?.addReducer?.(key, reducer);
    this.reducers[key] = reducer;
  };

  tag = () => intToChar(this.depth) + "_";

  computedLabels = () => {
    const result = {} as Record<string, any>;
    for (const [key, reducer] of Object.entries(this.reducers)) {
      const { array, reducefn, initalValue } = reducer;
      const { indices, tag } = this;
      const tagKey = tag() + key;
      result[tagKey] = array.reduce(reduceAt(reducefn, indices), initalValue);
    }
    return result;
  };

  labels = (): Record<string, any> => {
    const { parent, staticLabels, computedLabels } = this;
    const parentLabels = parent?.labels() ?? {};
    return Object.assign({}, parentLabels, staticLabels, computedLabels());
  };
}

const splitFactorIndices = (factor: Factor) => {
  const result = Array.from(Array(factor.cardinality), () => [] as number[]);
  for (let i = 0; i < factor.indices.length; i++)
    result[factor.indices[i]].push(i);
  return result;
};

class Partition {
  parent?: Partition;
  length: Accessor<number>;
  depth: number;
  factor: Accessor<Factor>;
  parts: Accessor<Part[]>;
  reducers: Record<string, Reducer<any, any>>;

  constructor(factor: Accessor<Factor>, parent?: Partition) {
    this.parent = parent;
    this.length = () => factor().length;
    this.depth = (parent?.depth ?? -1) + 1;
    this.factor = factor;
    this.reducers = parent?.reducers ?? {};

    this.parts = () => {
      const { parent, reducers } = this;
      const factor = this.factor();
      if (!factor.cardinality) {
        return [Part.of(this.singleton(), factor.labels, reducers)];
      }

      const parentFactor = parent?.factor() ?? Factor.isomorphism();
      const parentParts = parent?.parts() ?? [];
      const productFactor = Factor.product(parentFactor, factor);

      const splits = splitFactorIndices(productFactor);
      const [productIndices, parentIndices, productLabels] = [
        productFactor.indices,
        parentFactor.indices,
        productFactor.labels,
      ];

      const parentIndexMap = productIndices.reduce((result, prodIdx, idx) => {
        if (!result[prodIdx]) result[prodIdx] = parentIndices[idx];
        return result;
      }, Array(productFactor.cardinality));

      return splits.map((indices, j) => {
        const k = parentIndexMap[j] ?? 0;
        const labels = Object.assign({}, productLabels[j]);
        return Part.of(indices, labels, reducers, parentParts[k]);
      });
    };
  }

  nest = (factor: Accessor<Factor>) => new Partition(factor, this);
  singleton = () => seq(0, this.length());

  addReducer = <T, U>(key: string, reducer: Reducer<T, U>) => {
    this.reducers[key] = reducer;
    this.parent?.addReducer?.(key, reducer);
    return this;
  };
}

const ff = () => Factor.from({ cyl: dataMtcars.cyl });
const gg = () => Factor.from({ am: dataMtcars.am });

const partition69 = new Partition(ff);
const partition70 = partition69.nest(gg);

partition69.addReducer("sum", {
  array: dataMtcars.mpg,
  reducefn: sum,
  initalValue: 0,
});

console.log(partition70.parts().map((e) => e.labels()));
