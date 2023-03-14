import { Accessor, createEffect, createSignal } from "solid-js";
import { Dict } from "./Dict";
import { call } from "./funs";
import { Partition } from "./Partition";

const group = ["A", "B", "B", "C", "B", "A", "B"];
const gender = ["M", "M", "M", "M", "F", "F", "F"];
const marker = [0, 0, 1, 0, 1, 1, 0].map((x) => x.toString());
const arr1 = [100, 250, 150, 300, 400, 100, 150];

const [groupS, setGroupS] = createSignal(group);
const [genderS, setGenderS] = createSignal(gender);

const letters = ["a", "b", "c", "d", "e", "f"];

const JSONProduct = (factors: Record<string, string[]>) => {
  const entries = Object.entries(factors);
  return entries[0][1].reduce((result, _, index) => {
    const temp = {} as Record<string, any>;
    for (const [key, values] of entries) temp[key] = values[index];
    result[index] = JSON.stringify(temp);
    return result;
  }, [] as string[]);
};

const match = <T>(array: T[], value: T) =>
  array.flatMap((element, index) => (element === value ? index : []));

type ReduceFn<T, U> = (result: U, nextValue: T) => U;
type Reducer<T, U> = [T[], ReduceFn<T, U>, U];
const sum = (x: number, y: number) => x + y;
const product = (x: number, y: number) => x * y;

const reduceAtIndices =
  <T, U>(reducefn: ReduceFn<T, U>, indices: number[]) =>
  (result: U, nextValue: T, index: number) => {
    if (!indices.includes(index)) return result;
    return reducefn(result, nextValue);
  };

// class Partition {
//   tag: string;
//   parent?: Partition;
//   children: Partition[];
//   indices: number[];
//   staticLabels: Record<string, any>;
//   reducedLabels: Record<string, any>;
//   reducers: Record<string, Reducer<any, any>>;

//   constructor(
//     tag: string,
//     indices: number[],
//     staticLabels: Record<string, any>,
//     parent?: Partition
//   ) {
//     this.tag = `${parent?.tag ?? ""}${tag}`;
//     this.parent = parent;
//     this.children = [];
//     this.indices = indices;
//     this.staticLabels = staticLabels;
//     this.reducedLabels = {};
//     this.reducers = {};
//     if (parent) {
//       for (const [key, reducer] of Object.entries(parent.reducers))
//         this.addReducer(key, ...reducer);
//     }
//   }

//   static of = (
//     tag: string,
//     indices: number[],
//     staticLabels: Record<string, any>,
//     parent?: Partition
//   ) => {
//     return new Partition(tag, indices, staticLabels, parent);
//   };

//   level = (): number => (this.parent?.level() ?? -1) + 1;

//   addChild = (tag: string, indices: number[]) => {
//     this.children.push(Partition.of(tag, indices, {}, this));
//     return this;
//   };

//   addReducer = <T, U>(
//     key: string,
//     values: T[],
//     reducefn: ReduceFn<T, U>,
//     initialValue: U
//   ) => {
//     this.reducers[key] = [values, reducefn, initialValue];
//     this.reducedLabels[`${this.tag}[${key}]`] = values.reduce(
//       reduceAtIndices(reducefn, this.indices),
//       initialValue
//     );
//     return this;
//   };

//   nest = (factors: Record<string, any>) => {
//     const ids = JSONProduct(factors);
//     const uniqueIds = Array.from(new Set(ids));
//     for (const [i, id] of uniqueIds.entries()) {
//       const partitionId = letters[this.level() + 1] + i;
//       this.children.push(
//         new Partition(partitionId, match(ids, id), JSON.parse(id), this)
//       );
//     }
//     return this;
//   };

//   labels = (): Record<string, any> =>
//     Object.assign(
//       {},
//       this.staticLabels,
//       this.parent?.labels?.() ?? {},
//       this.reducedLabels
//     );
// }

// const inds = [0, 1, 2];
// const arr1 = [100, 200, 140, 200, 600, 350];

// // const part1 = Partition.of("object1", inds, {});
// // part1.addReducer("arr1Sum", arr1, sum, 0);
// // part1.addChild("mark1", [0, 1]);
// // part1.addChild("mark2", [2]);

// const partition0 = Partition.of("a0", [0, 1, 2, 3, 4, 5], {})
//   .addReducer("sum", arr1, sum, 0)
//   .addReducer("product", arr1, product, 1)
//   .nest({ group, gender });

// console.log(partition0.children[0]);

// // class PartitionRouter {
// //   factors: Record<string, () => string[]>;
// //   ids: () => string[];
// //   indexDict: () => Record<string, number[]>;

// //   constructor(factors: Record<string, () => string[]>) {
// //     this.factors = factors;
// //     this.ids = () => Dict.of(this.factors).map(call).flush(JSONProduct);
// //     this.indexDict = () => {
// //       return this.ids().reduce((result, nextId, index) => {
// //         if (!(nextId in result)) result[nextId] = [];
// //         result[nextId].push(index);
// //         return result;
// //       }, {} as Record<string, any>);
// //     };
// //   }
// // }

// // const router1 = new PartitionRouter({ genderS, groupS });

// // createEffect(() => console.log(router1.indexDict()));
// // setGenderS((x: string[]) => ["M", "M", "M", "M", "M", "M", "M"]);

const partition0 = Partition.of();
const partition1 = partition0.nest({ group, gender });
const partition2 = partition1.nest({ marker });

partition2.addReducer({
  tag: "sum",
  array: arr1,
  reducefn: sum,
  initialValue: 0,
});

console.log(partition2.parts[1]);
console.log(partition2.parts[1].labels());
