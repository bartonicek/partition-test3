import { Accessor, createEffect, createSignal } from "solid-js";
import { Dict } from "./Dict";
import { call, product, sum } from "./funs";
import { Partition } from "./Partition";

const group = ["A", "B", "B", "C", "B", "A", "B"];
const gender = ["M", "M", "M", "M", "F", "F", "F"];
const marker = [0, 0, 1, 0, 1, 1, 0];
const arr1 = [1.1, 1.2, 1.1, 1.3, 1.4, 1.2, 1.1];

const [groupS, setGroupS] = createSignal(group);
const [genderS, setGenderS] = createSignal(gender);
const [markerS, setmarkerS] = createSignal(marker);

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

const data1 = { gender: genderS, group: groupS };
const data2 = { marker: markerS };

const partition0 = Partition.of({});
const partition1 = partition0.nest(data1);
const partition2 = partition1.nest(data2);

partition2.addReducer({
  tag: "arr1Sum",
  array: arr1,
  reducefn: sum,
  initialValue: 0,
});

partition2.addReducer({
  tag: "arr1Product",
  array: arr1,
  reducefn: product,
  initialValue: 1,
});

setGenderS(() => Array(7).fill("M"));

// console.log(partition2.parts[1].labels());

// const labels = () => Dict.of(data).map(call).flush(JSONProduct);

// createEffect(() => {
//   console.log(labels());
// });

const empty = {};
