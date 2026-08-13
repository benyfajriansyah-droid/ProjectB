export type TemaId =
  | "belajar_ai"
  | "kirana_larasati"
  | "daily_life_nara"
  | "liburan_seru"
  | "cerita_kopi";

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
 * Identity colours, taken in the validated categorical order. The ordering is
 * the colourblind-safety mechanism, not decoration — re-run the palette
 * validator before changing it. Verified: worst adjacent pair ΔE 19.6 normal
 * vision, 9.1 under simulated CVD.
 */
export const TEMAS: {
  id: TemaId;
  label: string;
  short: string;
  color: string;
  tint: string;
  handles: Partial<Record<Platform, string>>;
}[] = [
  {
    id: "belajar_ai",
    label: "Belajar AI bareng Beny",
    short: "Belajar AI",
    color: "#2a78d6",
    tint: "#eaf2fd",
    handles: { ig: "@belajaraibarengbeny", tiktok: "@belajaraibarengbeny" },
  },
  {
    id: "kirana_larasati",
    label: "Cerita Kirana Larasati",
    short: "Kirana",
    color: "#eb6834",
    tint: "#fdeee8",
    handles: { ig: "@ceritakirana.larasati" },
  },
  {
    id: "daily_life_nara",
    label: "Daily Life Nara",
    short: "Nara",
    color: "#1baf7a",
    tint: "#e6f7f0",
    handles: { ig: "@dailylifenaraa", tiktok: "@dailylifenara" },
  },
  {
    id: "liburan_seru",
    label: "Liburan Seru bareng Bem",
    short: "Liburan",
    color: "#eda100",
    tint: "#fdf3e0",
    handles: { ig: "@liburanserubarengbem", tiktok: "@liburanserubarengbem" },
  },
  {
    id: "cerita_kopi",
    label: "Cerita Kopi Beny",
    short: "Kopi",
    color: "#e87ba4",
    tint: "#fdedf3",
    handles: { ig: "@ceritakopibeny", tiktok: "@ceritakopibeny" },
  },
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

export const PLATFORM_LABELS: Record<Platform, string> = {
  ig: "Instagram",
  tiktok: "TikTok",
};

export const PLATFORM_SHORT: Record<Platform, string> = {
  ig: "IG",
  tiktok: "TT",
};

export function tema(id: string) {
  return TEMAS.find((t) => t.id === id);
}

export function temaLabel(id: string): string {
  return tema(id)?.label ?? id;
}

export function temaColor(id: string): string {
  return tema(id)?.color ?? "#8a8880";
}

export function platformsForTema(id: string): Platform[] {
  const found = tema(id);
  if (!found) return [];
  return Object.keys(found.handles) as Platform[];
}
