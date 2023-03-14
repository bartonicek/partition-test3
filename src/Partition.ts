import {
  JSONProduct,
  fromJSON,
  match,
  reduceWithIndices,
  subset,
} from "./funs";

const letters = ["a", "b", "c", "d", "e", "f"];

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
    this.tag = tag;
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
    const { parent, indices, reducers, ownLabels } = this;
    const reducedLabels = {} as Record<string, any>;
    for (const { tag, array, reducefn, initialValue } of reducers.values())
      reducedLabels[this.tag + `[${tag}]`] = array.reduce(
        indices.length ? reduceWithIndices(reducefn, indices) : reducefn,
        initialValue
      );
    return Object.assign({}, ownLabels, parent?.labels(), reducedLabels);
  };
}

export class Partition {
  parts: Part[];
  parent?: Partition;
  reducers: Reducer<any, any>[];

  constructor(parent?: Partition) {
    this.parent = parent;
    this.parts = [];
    this.reducers = [];
    if (!parent) this.parts.push(Part.of("a0", [], {}));
  }

  static of = (parent?: Partition) => new Partition(parent);

  level = (): number => (this.parent?.level() ?? -1) + 1;

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    this.parts.forEach((part) => part.addReducer(reducer));
    this.parent?.addReducer(reducer);
    return this;
  };

  nest = (factors: Record<string, string[]>) => {
    const labels = JSONProduct(factors);
    const uniqueLabels = Array.from(new Set(labels));
    const child = Partition.of(this);

    for (const part of this.parts.values()) {
      const { indices } = part;
      const partLabels = indices.length ? subset(labels, indices) : labels;

      for (const [i, label] of uniqueLabels.entries()) {
        const tag = part.tag + letters[this.level() + 1] + i;
        const indices = match(partLabels, label);
        if (indices.length)
          child.parts.push(Part.of(tag, indices, fromJSON(label), part));
      }
    }

    return child;
  };
}
