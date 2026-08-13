/**
 * Pure money types and formatting — no database import, so client components
 * can use these without pulling a driver into the browser bundle.
 */

export type TxKind = "masuk" | "keluar";

export type Transaction = {
  id: string;
  kind: TxKind;
  amount: number;
  category: string;
  venture: string | null;
  note: string | null;
  occurredOn: string;
};

export type MonthSummary = {
  month: string;
  masuk: number;
  keluar: number;
  bersih: number;
};

/** Monthly income target, in rupiah. */
export const TARGET_BULANAN = 10_000_000;

export const KATEGORI_MASUK = [
  "Konten / brand deal",
  "Jasa / project",
  "Produk digital",
  "Gaji",
  "Lainnya",
];

export const KATEGORI_KELUAR = [
  "Operasional",
  "Tools / langganan",
  "Iklan",
  "Kebutuhan pribadi",
  "Lainnya",
];

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}
