import { Accessor } from "solid-js";
import { expandRange } from "../utils/graphicfuns";
import { Scale } from "./Scale";
import { call } from "../utils/funs";

type DynamicRange = [Accessor<number>, Accessor<number>];

export class ScaleContinuous implements Scale<number> {
  private _domain: DynamicRange;
  private _codomain: DynamicRange;
  expand: DynamicRange | undefined;
  zero: boolean | undefined;

  constructor(
    domain: DynamicRange,
    codomain: DynamicRange,
    expand?: DynamicRange
  ) {
    this._domain = domain;
    this._codomain = codomain;
    this.expand = expand;
  }

  static of = (
    domain: DynamicRange,
    codomain: DynamicRange,
    expand?: DynamicRange
  ) => new ScaleContinuous(domain, codomain, expand);

  get domain() {
    const { _domain, expand } = this;
    if (expand)
      return expandRange(
        _domain.map(call) as [number, number],
        expand.map(call) as [number, number]
      );
    return _domain.map(call) as [number, number];
  }

  get codomain() {
    return this._codomain.map(call) as [number, number];
  }

  get domainRange() {
    return this.domain[1] - this.domain[0];
  }

  get codomainRange() {
    return this.codomain[1] - this.codomain[0];
  }

  pushforward = (values: number[]) => {
    const { domain, codomain, domainRange, codomainRange } = this;
    return values.map((value) => {
      return codomain[0] + ((value - domain[0]) / domainRange) * codomainRange;
    });
  };

  pullback = (values: number[]) => {
    const { domain, codomain, domainRange, codomainRange } = this;
    return values.map((value) => {
      return domain[0] + ((value - codomain[0]) / codomainRange) * domainRange;
    });
  };
}
