export const CSS = (attribute: string) => (element: HTMLElement) => {
  return getComputedStyle(element)[attribute as any];
};

export const CSSHeight = CSS("width");
export const CSSWidth = CSS("height");

export const CSSWidthHeight = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return [style.width, style.height] as [string, string];
};

export const withAlpha = (alpha: number) => (colour: string) => {
  if (alpha >= 1) return colour;
  let alpha16 = Math.floor(alpha * 255)
    .toString(16)
    .toUpperCase();
  if (alpha16.length < 2) alpha16 = "0" + alpha16;
  return colour + alpha16;
};

export const expandRange = (
  range: [number, number],
  expand: [number, number]
) => {
  const rangeRange = range[1] - range[0];
  return [
    range[0] - expand[0] * rangeRange,
    range[1] + expand[1] * rangeRange,
  ] as [number, number];
};
