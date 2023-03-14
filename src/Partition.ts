import { Accessor, createEffect } from "solid-js";
import { Dict } from "./Dict";
import { JSONProduct, call, fromJSON, match, reduceAt, subset } from "./funs";

const partitionNames = ["whole", "object", "marker", "d", "e", "f"];
type FactorRecord = { [key: string]: Accessor<string[] | number[]> };

export class Part {
  tag: string;
  parent?: Part;
  indices: number[];
  ownLabels: Record<string, any>;
  reducers: Reducer<any, any>[];

  constructor(
    tag: string,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part
  ) {
    this.tag = (parent?.tag ? parent.tag + "." : "") + tag;
    this.parent = parent;
    this.indices = indices;
    this.ownLabels = labels;
    this.reducers = [];
  }

  static of = (
    tag: string,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part
  ) => new Part(tag, indices, labels, parent);

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    return this;
  };

  labels = (): Record<string, any> => {
    const { tag: partTag, parent, indices, reducers, ownLabels } = this;
    const reducedLabels = {} as Record<string, any>;
    for (let { tag, array, reducefn, initialValue } of reducers.values()) {
      if (indices.length) reducefn = reduceAt(reducefn, indices);
      const reduceTag = partTag + `{${tag}}`;
      reducedLabels[reduceTag] = array.reduce(reducefn, initialValue);
    }
    return Object.assign({}, ownLabels, parent?.labels(), reducedLabels);
  };
}

export class Partition {
  parts: Part[];
  parent?: Partition;
  factors: FactorRecord;
  reducers: Reducer<any, any>[];

  constructor(factors: FactorRecord, parent?: Partition) {
    this.parent = parent;
    this.parts = [];
    this.factors = factors;
    this.reducers = [];
    if (!parent) this.parts.push(Part.of("whole", [], {}));

    const labels = () => Dict.of(factors).map(call).flush(JSONProduct);
  }

  static of = (factors: FactorRecord, parent?: Partition) =>
    new Partition(factors, parent);

  level = (): number => (this.parent?.level() ?? -1) + 1;

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    this.parts.forEach((part) => part.addReducer(reducer));
    this.parent?.addReducer(reducer);
    return this;
  };

  nest = (factors: FactorRecord) => {
    const labels = Dict.of(factors).map(call).flush(JSONProduct);
    const uniqueLabels = Array.from(new Set(labels));
    const child = Partition.of(factors, this);

    for (const parentPart of this.parts.values()) {
      const { indices } = parentPart;
      const parentLabels = indices.length ? subset(labels, indices) : labels;

      for (const [i, label] of uniqueLabels.entries()) {
        const indices = match(parentLabels, label);
        if (!indices.length) continue;
        const tag = partitionNames[this.level() + 1] + i;
        child.parts.push(Part.of(tag, indices, fromJSON(label), parentPart));
      }
    }

    return child;
  };
}
