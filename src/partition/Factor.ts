import { toJSON, unique } from "../utils/funs";

export class Factor {
  indices: number[];
  labels: Record<number, Record<string, any>>;
  cardinality: number;

  constructor(indices: number[], labels: Record<number, Record<string, any>>) {
    this.indices = indices;
    this.labels = labels;
    this.cardinality = Object.keys(labels).length;
  }

  get length() {
    return this.indices.length;
  }

  static isomorphism = () => new Factor([], {});

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
    factors = factors.filter((factor) => factor.cardinality > 0);
    if (factors.length === 1) return factors[0];

    const dirtyLabels = {} as Record<string, Record<string, any>>;
    const dirtyIndexSet = new Set<string>();

    const dirtyIndices = factors[0].indices.map((_, i) => {
      const factorIndices = factors.map((x) => x.indices[i]);
      const dirtyIndex = factorIndices.join("");
      dirtyIndexSet.add(dirtyIndex);

      if (!(dirtyIndex in dirtyLabels)) {
        const factorLabels = factors.map(
          (factor, j) => factor.labels[factorIndices[j]]
        );
        dirtyLabels[dirtyIndex] = Object.assign({}, ...factorLabels);
      }

      return dirtyIndex;
    });

    const dirtyIndexArr = Array.from(dirtyIndexSet).sort();
    const indices = dirtyIndices.map((value) => dirtyIndexArr.indexOf(value));
    const labels = Object.fromEntries(
      Object.entries(dirtyLabels).map(([dirtyIndex, value]) => {
        return [dirtyIndexArr.indexOf(dirtyIndex), value];
      })
    );

    return new Factor(indices, labels);
  };
}
