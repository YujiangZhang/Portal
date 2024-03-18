const colors = [
  "green",
  "blue",
  "pink",
  "red",
  "orange",
  "purple",
  "gold",
  "volcano",
  "magenta",
];

export function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getColorByIndex(index: number) {
  return colors[index % colors.length];
}

/**
 * 十六进制颜色转 RGB
 */
export function hexToRgb(hex: string, toString = true) {
  const rgb = [];
  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
  }

  if (toString) {
    return rgb.join(",");
  } else {
    return rgb;
  }
}
