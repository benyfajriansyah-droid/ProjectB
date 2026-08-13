export type Platform = "ig" | "tiktok";

export type Status = "ide_baru" | "draft" | "terjadwal" | "tayang" | "skip";

export const STATUSES: Status[] = ["ide_baru", "draft", "terjadwal", "tayang", "skip"];

export const STATUS_LABELS: Record<Status, string> = {
  ide_baru: "Ide baru",
  draft: "Draft",
  terjadwal: "Terjadwal",
  tayang: "Tayang",
  skip: "Skip",
};

/**
 * The first three are stages of one process, so they take an ordinal blue ramp
 * light-to-dark. Tayang is a completed state and takes the reserved "good"
 * status colour; skip recedes. Every chip carries its label, so colour never
 * has to carry the meaning alone.
 */
export const STATUS_INK: Record<Status, { fg: string; bg: string }> = {
  ide_baru: { fg: "#1c5cab", bg: "#e8f0fd" },
  draft: { fg: "#175293", bg: "#dbe8fb" },
  terjadwal: { fg: "#0d366b", bg: "#cde2fb" },
  tayang: { fg: "#0a7d0a", bg: "#e4f5e4" },
  skip: { fg: "#8a8880", bg: "#f0efec" },
};

/**
 * Identity colours in the validated categorical order. The ordering is the
 * colourblind-safety mechanism, not decoration — re-run the palette validator
 * before changing it. Verified on white: worst adjacent pair ΔE 19.6 normal
 * vision, 9.1 under simulated CVD. New personas take the next unused slot.
 */
export const PALETTE_SLOTS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

/** Soft background paired with each slot, for selected chips. */
export const PALETTE_TINTS: Record<string, string> = {
  "#2a78d6": "#eaf2fd",
  "#eb6834": "#fdeee8",
  "#1baf7a": "#e6f7f0",
  "#eda100": "#fdf3e0",
  "#e87ba4": "#fdedf3",
  "#008300": "#e6f4e6",
  "#4a3aa7": "#eeecf9",
  "#e34948": "#fdecec",
};

export function tintFor(color: string): string {
  return PALETTE_TINTS[color] ?? "#f0efec";
}

/**
 * What a brand-new database starts with. After the first run the accounts table
 * is the source of truth and this list is never consulted again.
 */
export const SEED_ACCOUNTS: {
  themeKey: string;
  themeLabel: string;
  platform: Platform;
  handle: string;
  color: string;
  sortOrder: number;
}[] = [
  { themeKey: "belajar_ai", themeLabel: "Belajar AI bareng Beny", platform: "ig", handle: "@belajaraibarengbeny", color: "#2a78d6", sortOrder: 1 },
  { themeKey: "belajar_ai", themeLabel: "Belajar AI bareng Beny", platform: "tiktok", handle: "@belajaraibarengbeny", color: "#2a78d6", sortOrder: 2 },
  { themeKey: "kirana_larasati", themeLabel: "Cerita Kirana Larasati", platform: "ig", handle: "@ceritakirana.larasati", color: "#eb6834", sortOrder: 3 },
  { themeKey: "daily_life_nara", themeLabel: "Daily Life Nara", platform: "ig", handle: "@dailylifenaraa", color: "#1baf7a", sortOrder: 4 },
  { themeKey: "daily_life_nara", themeLabel: "Daily Life Nara", platform: "tiktok", handle: "@dailylifenara", color: "#1baf7a", sortOrder: 5 },
  { themeKey: "liburan_seru", themeLabel: "Liburan Seru bareng Bem", platform: "ig", handle: "@liburanserubarengbem", color: "#eda100", sortOrder: 6 },
  { themeKey: "liburan_seru", themeLabel: "Liburan Seru bareng Bem", platform: "tiktok", handle: "@liburanserubarengbem", color: "#eda100", sortOrder: 7 },
  { themeKey: "cerita_kopi", themeLabel: "Cerita Kopi Beny", platform: "ig", handle: "@ceritakopibeny", color: "#e87ba4", sortOrder: 8 },
  { themeKey: "cerita_kopi", themeLabel: "Cerita Kopi Beny", platform: "tiktok", handle: "@ceritakopibeny", color: "#e87ba4", sortOrder: 9 },
];

/** Single-series chart marks and the reference line for the target. */
export const CHART_INK = {
  series: "#2a78d6",
  seriesSoft: "#cde2fb",
  reference: "#8a8880",
  grid: "#e6e5df",
  good: "#0ca30c",
  critical: "#d03b3b",
};

export const PLATFORMS: Platform[] = ["ig", "tiktok"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  ig: "Instagram",
  tiktok: "TikTok",
};

export const PLATFORM_SHORT: Record<Platform, string> = {
  ig: "IG",
  tiktok: "TT",
};
