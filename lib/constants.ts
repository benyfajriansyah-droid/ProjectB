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
 * Status colours follow the progression of the work: neutral while untouched,
 * warm while in progress, blue once committed to a date, green when live.
 */
export const STATUS_STYLES: Record<Status, string> = {
  ide_baru: "bg-slate-100 text-slate-600 ring-slate-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  terjadwal: "bg-blue-50 text-blue-700 ring-blue-200",
  tayang: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  skip: "bg-slate-50 text-slate-400 ring-slate-200 line-through",
};

/** Full class strings, not interpolated — Tailwind only keeps classes it can see. */
export type Accent = {
  dot: string;
  bar: string;
  chipBg: string;
  chipText: string;
  softBg: string;
  border: string;
};

export const TEMAS: {
  id: TemaId;
  label: string;
  short: string;
  handles: Partial<Record<Platform, string>>;
  accent: Accent;
}[] = [
  {
    id: "belajar_ai",
    label: "Belajar AI bareng Beny",
    short: "Belajar AI",
    handles: { ig: "@belajaraibarengbeny", tiktok: "@belajaraibarengbeny" },
    accent: {
      dot: "bg-violet-500",
      bar: "bg-violet-500",
      chipBg: "bg-violet-50",
      chipText: "text-violet-700",
      softBg: "bg-violet-50/60",
      border: "border-violet-100",
    },
  },
  {
    id: "kirana_larasati",
    label: "Cerita Kirana Larasati",
    short: "Kirana",
    handles: { ig: "@ceritakirana.larasati" },
    accent: {
      dot: "bg-rose-500",
      bar: "bg-rose-500",
      chipBg: "bg-rose-50",
      chipText: "text-rose-700",
      softBg: "bg-rose-50/60",
      border: "border-rose-100",
    },
  },
  {
    id: "daily_life_nara",
    label: "Daily Life Nara",
    short: "Nara",
    handles: { ig: "@dailylifenaraa", tiktok: "@dailylifenara" },
    accent: {
      dot: "bg-orange-500",
      bar: "bg-orange-500",
      chipBg: "bg-orange-50",
      chipText: "text-orange-700",
      softBg: "bg-orange-50/60",
      border: "border-orange-100",
    },
  },
  {
    id: "liburan_seru",
    label: "Liburan Seru bareng Bem",
    short: "Liburan",
    handles: { ig: "@liburanserubarengbem", tiktok: "@liburanserubarengbem" },
    accent: {
      dot: "bg-teal-500",
      bar: "bg-teal-500",
      chipBg: "bg-teal-50",
      chipText: "text-teal-700",
      softBg: "bg-teal-50/60",
      border: "border-teal-100",
    },
  },
  {
    id: "cerita_kopi",
    label: "Cerita Kopi Beny",
    short: "Kopi",
    handles: { ig: "@ceritakopibeny", tiktok: "@ceritakopibeny" },
    accent: {
      dot: "bg-amber-600",
      bar: "bg-amber-600",
      chipBg: "bg-amber-50",
      chipText: "text-amber-800",
      softBg: "bg-amber-50/60",
      border: "border-amber-100",
    },
  },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  ig: "Instagram",
  tiktok: "TikTok",
};

export function tema(id: string) {
  return TEMAS.find((t) => t.id === id);
}

export function temaLabel(id: string): string {
  return tema(id)?.label ?? id;
}

export function platformsForTema(id: string): Platform[] {
  const found = tema(id);
  if (!found) return [];
  return Object.keys(found.handles) as Platform[];
}
