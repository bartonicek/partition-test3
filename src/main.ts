import "./styles.css";
import { Accessor, createEffect, createSignal } from "solid-js";
import { product, sum, unique } from "./utils/funs";
import { Partition } from "./partition/Partition";
import { GraphicStack } from "./plot/GraphicStack";
import { SizeHandler } from "./handlers/SizeHandler";
import { Points } from "./primitives/Points";
import { Rectangles } from "./primitives/Rectangles";
import { ScaleContinuous } from "./scales/ScaleContinuous";
import { ScaleDiscrete } from "./scales/ScaleDiscrete";
import { Line } from "./primitives/Line";

const group = ["A", "B", "B", "C", "B", "A", "B"];
const gender = ["M", "M", "M", "M", "F", "F", "F"];
const marker = [1, 2, 3, 1, 2, 3, 1];
// const arr1 = [1.1, 1.2, 1.1, 1.3, 1.4, 1.2, 1.1];

// const [groupS, setGroupS] = createSignal(group);
// const [genderS, setGenderS] = createSignal(gender);
// const [markerS, setmarkerS] = createSignal(marker);

// const data1 = { gender: genderS, group: groupS };
// const data2 = { marker: markerS };

// const partition0 = Partition.of({});
// const partition1 = partition0.nest(data1);
// const partition2 = partition1.nest(data2);

// partition2.addReducer({
//   tag: "arr1Sum",
//   array: arr1,
//   reducefn: sum,
//   initialValue: 0,
// });

// partition2.addReducer({
//   tag: "arr1Product",
//   array: arr1,
//   reducefn: product,
//   initialValue: 1,
// });

const app = document.querySelector("#app") as HTMLDivElement;
app.classList.add("plotscape-scene");

const stack1 = new GraphicStack(app);

const x = Array.from(Array(100), () => Math.random());
const y = Array.from(Array(100), () => Math.random());

const pp = new Points(
  [0, 0.1, 0.2, 0.3],
  [-0.05, -0.05, -0.05, -0.05],
  stack1.layers.outer.scales.innerPct
);
stack1.layers.outer.addPrimitive(pp);

// const points1 = new Points(x, y, stack1.layers.highlight.scales);

// points1.draw(stack1.layers.highlight.context);
// stack1.layers.highlight.addPrimitive(points1);

// console.log(stack1.width());
// console.log(getComputedStyle(stack1.container).width);
// console.log(stack1.layers.outer.width());

class Factor {
  indices: number[];
  labels: Record<number, Record<string, any>>;
  cardinality: number;

  constructor(indices: number[], labels: Record<number, Record<string, any>>) {
    this.indices = indices;
    this.labels = labels;
    this.cardinality = Object.keys(labels).length;
  }

  static from = <T>(wrappedArray: Record<string, T[]>, labels?: T[]) => {
    const key = Object.keys(wrappedArray)[0];
    const labelArr = labels ?? unique(wrappedArray[key]).sort()!;
    const labelObj = Object.fromEntries(
      [...labelArr.entries()].map(([index, value]) => [index, { [key]: value }])
    );

    const indices = wrappedArray[key].map((value) => labelArr.indexOf(value));
    return new Factor(indices, labelObj);
  };

  static product = (...factors: Factor[]) => {
    const dirtyLabels = {} as Record<number, Record<string, any>>;
    const usedIndexSet = new Set<number>();

    const dirtyIndices = factors[0].indices.map((_, i) => {
      const factorIndices = factors.map((x) => x.indices[i]);
      const index = factorIndices.reduce(
        (result, nextValue, j) => result + nextValue * (j + 1)
      );
      usedIndexSet.add(index);

      if (!(index in dirtyLabels)) {
        const factorLabels = factors.map(
          (factor, j) => factor.labels[factorIndices[j]]
        );
        dirtyLabels[index] = Object.assign({}, ...factorLabels);
      }

      return index;
    });

    const usedIndexArr = Array.from(usedIndexSet).sort();
    const indices = dirtyIndices.map((value) => usedIndexArr.indexOf(value));
    const labels = Object.fromEntries(
      Object.entries(dirtyLabels).map(([index, value]) => {
        return [usedIndexArr.indexOf(parseInt(index, 10)), value];
      })
    );

    return new Factor(indices, labels);
  };
}

const factor1 = Factor.from({ group });
const factor2 = Factor.from({ gender });
const factor3 = Factor.from({ marker });

const product1 = Factor.product(factor1, factor2, factor3);

console.log(product1);
