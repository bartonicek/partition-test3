import { Accessor } from "solid-js";
import { Factor } from "./Factor";
import { Reducer } from "../types";
import { reduceAt } from "../utils/funs";

const partitionLabels = ["a", "b", "c", "d"];

export class Part2 {
  tag: string;
  indices: number[];
  staticLabels: Record<string, any>;
  parent?: Part2;
  reducers: Reducer<any, any>[];

  constructor(
    tag: string,
    partition: Partition2,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part2
  ) {
    this.tag = `_${tag}`;
    this.parent = parent;
    this.indices = indices;
    this.staticLabels = labels;
    this.reducers = partition.reducers;
  }

  static of = (
    tag: string,
    partition: Partition2,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part2
  ) => new Part2(tag, partition, indices, labels, parent);

  labels = (): any => {
    const { tag: partTag, parent, indices, reducers, staticLabels } = this;
    const reducedLabels = {} as Record<string, any>;
    for (let { tag, array, reducefn, initialValue } of reducers.values()) {
      if (indices.length) reducefn = reduceAt(reducefn, indices);
      const reduceTag = partTag + `{${tag}}`;
      reducedLabels[reduceTag] = array.reduce(reducefn, initialValue);
    }
    return Object.assign({}, staticLabels, parent?.labels(), reducedLabels);
  };
}

const splitIndices = (factor: Factor) => {
  const result = Array.from(Array(factor.cardinality), () => [] as number[]);
  for (let i = 0; i < factor.indices.length; i++)
    result[factor.indices[i]].push(i);
  return result;
};

export class Partition2 {
  factor: Accessor<Factor>;
  parent?: Partition2;
  reducers: Reducer<any, any>[];

  constructor(factor?: Accessor<Factor>, parent?: Partition2) {
    this.parent = parent;
    this.factor = factor ?? (() => Factor.isomorphism());
    this.reducers = [];
  }

  level = (): number => (this.parent?.level() ?? -1) + 1;
  nest = (factor: Accessor<Factor>) => new Partition2(factor, this);

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    this.parent?.addReducer(reducer);
    return this;
  };

  parts = (): any => {
    const newF = this.factor();
    if (!newF.cardinality) return [Part2.of("a0", this, [], {})];

    const [parF, parParts] = [this.parent!.factor(), this.parent!.parts()];
    const prodF = Factor.product(parF, newF);
    const splits = splitIndices(prodF);

    const childParentIndex = prodF.indices.reduce(
      (result, nextValue, index) => {
        if (!result[nextValue]) result[nextValue] = parF.indices[index];
        return result;
      },
      Array(prodF.cardinality)
    );

    return splits.map((indices, i) => {
      const j = childParentIndex[i] ?? 0;
      const tag = partitionLabels[this.level()] + i;
      const labels = Object.assign({}, parF.labels[j], prodF.labels[i]);
      return Part2.of(tag, this, indices, labels, parParts[j]);
    });
  };
}
