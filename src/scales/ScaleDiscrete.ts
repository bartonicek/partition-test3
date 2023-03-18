import { Scale } from "./Scale";

export class ScaleDiscrete implements Scale<string> {
  private _domain: [number, number];
  private _codomain: [number, number];
  private labels: string[];
  private positions: number[];

  constructor(
    labels: string[],
    codomain: [number, number],
    expand?: [number, number]
  ) {
    this._domain = [0, 1];
    this._codomain = codomain;
    this.labels = labels;
    this.positions = Array.from(labels, (_, i) => i / (labels.length - 1));
  }

  get domain() {
    return this._domain;
  }

  get codomain() {
    return this._codomain;
  }

  get domainRange() {
    return this.domain[1] - this.domain[0];
  }

  get codomainRange() {
    return this.codomain[1] - this.codomain[0];
  }

  pushforward = (values: string[]) => {
    const { codomain, codomainRange, labels, positions } = this;
    return values.map((value) => {
      // if (!labels.includes(value)) return;
      return codomain[0] + positions[labels.indexOf(value)] * codomainRange;
    });
  };

  pullback = (values: number[]) => {
    const { labels, positions } = this;
    return values.map((value) => {
      // if (!positions.includes(value)) return;
      return labels[positions.indexOf(value)];
    });
  };
}
