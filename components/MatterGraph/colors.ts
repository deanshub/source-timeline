export const pallette = [
  "#277DA1",
  "#577590",
  "#4d908e",
  "#43aa8b",
  "#90be6d",
  "#F9C74F",
  "#F9844A",
  "#F8961E",
  "#F3722C",
  "#F94144"
];

let colorIndex = 0;

export function getColor() {
  if (colorIndex >= pallette.length) {
    colorIndex = 0;
  }
  return pallette[colorIndex++];
}

export const gray = "#8D99AE";
