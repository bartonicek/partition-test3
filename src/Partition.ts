import { Accessor, createEffect } from "solid-js";
import { Dict } from "./Dict";
import { JSONProduct, call, fromJSON, match, reduceAt, subset } from "./funs";

const partitionNames = ["whole", "object", "mark", "d", "e", "f"];
type FactorRecord = { [key: string]: Accessor<string[] | number[]> };

export class Part {
  tag: string;
  parent?: Part;
  indices: number[];
  ownLabels: Record<string, any>;
  reducers: Reducer<any, any>[];

  constructor(
    tag: string,
    partition: Partition,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part
  ) {
    this.tag = (parent?.tag ? parent.tag + "." : "") + tag;
    this.parent = parent;
    this.indices = indices;
    this.ownLabels = labels;
    this.reducers = partition.reducers;
  }

  static of = (
    tag: string,
    partition: Partition,
    indices: number[],
    labels: Record<string, any>,
    parent?: Part
  ) => new Part(tag, partition, indices, labels, parent);

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
  parts: () => Part[];
  parent?: Partition;
  factors: FactorRecord;
  reducers: Reducer<any, any>[];
  ids: () => string[];

  constructor(factors: FactorRecord, parent?: Partition) {
    this.parent = parent;
    this.factors = factors;
    this.reducers = [];
    this.ids = () => Dict.of(factors).map(call).flush(JSONProduct);

    if (!parent) {
      this.parts = () => [Part.of("whole", this, [], {})];
      return this;
    }

    this.parts = () => {
      const [ids, parentParts] = [this.ids(), this.parent?.parts()];
      const uniqueIds = Array.from(new Set(ids)).sort();
      const result = [];
      for (const parentPart of parentParts!.values()) {
        const { indices } = parentPart;
        const parentIds = indices.length ? subset(ids, indices) : ids;

        for (const [i, id] of uniqueIds.entries()) {
          const indices = match(parentIds, id);
          if (!indices.length) continue;
          const tag = partitionNames[this.level()] + i;
          result.push(Part.of(tag, this, indices, fromJSON(id), parentPart));
        }
      }
      return result;
    };
  }

  static of = (factors: FactorRecord, parent?: Partition) =>
    new Partition(factors, parent);

  level = (): number => (this.parent?.level() ?? -1) + 1;

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    this.parent?.addReducer(reducer);
    return this;
  };

  nest = (factors: FactorRecord) => {
    return Partition.of(factors, this);
  };
}
