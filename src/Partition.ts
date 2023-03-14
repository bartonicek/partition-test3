import {
  JSONProduct,
  fromJSON,
  match,
  reduceWithIndices,
  subset,
} from "./funs";

const partitionNames = ["whole", "object", "marker", "d", "e", "f"];

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
    const { parent, indices, reducers, ownLabels } = this;
    const reducedLabels = {} as Record<string, any>;
    for (const { tag, array, reducefn, initialValue } of reducers.values())
      reducedLabels[this.tag + `{${tag}}`] = array.reduce(
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
    if (!parent) this.parts.push(Part.of("whole", [], {}));
  }

  static of = (parent?: Partition) => new Partition(parent);

  level = (): number => (this.parent?.level() ?? -1) + 1;

  addReducer = <T, U>(reducer: Reducer<T, U>) => {
    this.reducers.push(reducer);
    this.parts.forEach((part) => part.addReducer(reducer));
    this.parent?.addReducer(reducer);
    return this;
  };

  nest = (factors: Record<string, string[] | number[]>) => {
    const labels = JSONProduct(factors);
    const uniqueLabels = Array.from(new Set(labels));
    const child = Partition.of(this);

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
