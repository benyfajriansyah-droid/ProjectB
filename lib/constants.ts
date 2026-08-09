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

export const TEMAS: {
  id: TemaId;
  label: string;
  handles: Partial<Record<Platform, string>>;
}[] = [
  {
    id: "belajar_ai",
    label: "Belajar AI bareng Beny",
    handles: { ig: "@belajaraibarengbeny", tiktok: "@belajaraibarengbeny" },
  },
  {
    id: "kirana_larasati",
    label: "Cerita Kirana Larasati",
    handles: { ig: "@ceritakirana.larasati" },
  },
  {
    id: "daily_life_nara",
    label: "Daily Life Nara",
    handles: { ig: "@dailylifenaraa", tiktok: "@dailylifenara" },
  },
  {
    id: "liburan_seru",
    label: "Liburan Seru bareng Bem",
    handles: { ig: "@liburanserubarengbem", tiktok: "@liburanserubarengbem" },
  },
  {
    id: "cerita_kopi",
    label: "Cerita Kopi Beny",
    handles: { ig: "@ceritakopibeny", tiktok: "@ceritakopibeny" },
  },
];

export function temaLabel(id: string): string {
  return TEMAS.find((t) => t.id === id)?.label ?? id;
}

export function platformsForTema(id: string): Platform[] {
  const tema = TEMAS.find((t) => t.id === id);
  if (!tema) return [];
  return Object.keys(tema.handles) as Platform[];
}
