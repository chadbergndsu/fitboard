/** Approximate Twin Cities / Upper Midwest board positions (viewBox 0 0 100 100). */

export type BoardPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "core" | "metro" | "region";
};

export const BOARD_CITIES: BoardPoint[] = [
  { id: "minneapolis", label: "Minneapolis", x: 36, y: 38, kind: "core" },
  { id: "st-paul", label: "St. Paul", x: 56, y: 40, kind: "core" },
  { id: "bloomington", label: "Bloomington", x: 34, y: 56, kind: "metro" },
  { id: "edina", label: "Edina", x: 26, y: 50, kind: "metro" },
  { id: "eagan", label: "Eagan", x: 50, y: 58, kind: "metro" },
  { id: "burnsville", label: "Burnsville", x: 40, y: 68, kind: "metro" },
  { id: "lakeville", label: "Lakeville", x: 38, y: 82, kind: "metro" },
  { id: "fargo", label: "Fargo", x: 10, y: 14, kind: "region" },
  { id: "duluth", label: "Duluth", x: 70, y: 10, kind: "region" },
  { id: "rochester", label: "Rochester", x: 76, y: 84, kind: "region" },
  { id: "eau-claire", label: "Eau Claire", x: 86, y: 34, kind: "region" },
  { id: "sioux-falls", label: "Sioux Falls", x: 12, y: 90, kind: "region" },
];

const ALIASES: Record<string, string> = {
  minneapolis: "minneapolis",
  "minn.": "minneapolis",
  "st paul": "st-paul",
  "st. paul": "st-paul",
  saintpaul: "st-paul",
  bloomington: "bloomington",
  edina: "edina",
  eagan: "eagan",
  burnsville: "burnsville",
  lakeville: "lakeville",
  fargo: "fargo",
  duluth: "duluth",
  rochester: "rochester",
  "eau claire": "eau-claire",
  "sioux falls": "sioux-falls",
};

export function cityIdFromLocation(location: string): string {
  const lower = location.toLowerCase();
  for (const [alias, id] of Object.entries(ALIASES)) {
    if (lower.includes(alias)) return id;
  }
  return "minneapolis";
}

export function boardPointForLocation(location: string): BoardPoint {
  const id = cityIdFromLocation(location);
  return BOARD_CITIES.find((c) => c.id === id) ?? BOARD_CITIES[0];
}

/** Jitter so two people in the same city don't stack. */
export function offsetPoint(
  base: BoardPoint,
  seed: string,
  radius = 4.2,
): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = ((h % 360) * Math.PI) / 180;
  const r = 1.2 + (h % 100) / 100 * radius;
  return {
    x: Math.min(96, Math.max(4, base.x + Math.cos(a) * r)),
    y: Math.min(96, Math.max(4, base.y + Math.sin(a) * r)),
  };
}
