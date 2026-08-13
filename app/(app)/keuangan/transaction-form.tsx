"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KATEGORI_KELUAR, KATEGORI_MASUK, type TxKind } from "@/lib/finance";

function todayLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** "1.500.000" or "1500000" both mean the same thing when typing fast. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatThousands(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export default function TransactionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<TxKind>("masuk");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(KATEGORI_MASUK[0]);
  const [venture, setVenture] = useState("");
  const [note, setNote] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayLocal());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = kind === "masuk" ? KATEGORI_MASUK : KATEGORI_KELUAR;

  function switchKind(next: TxKind) {
    setKind(next);
    setCategory(next === "masuk" ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]);
  }

  async function handleSave() {
    const value = parseAmount(amount);
    if (value <= 0) {
      setError("Nominal harus diisi.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, amount: value, category, venture, note, occurredOn }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Gagal menyimpan.");
        return;
      }

      setAmount("");
      setNote("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 transition hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-700"
      >
        + Catat transaksi
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-2">
        {(["masuk", "keluar"] as const).map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              kind === k
                ? k === "masuk"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {k === "masuk" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">Nominal</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(formatThousands(e.target.value))}
            placeholder="0"
            autoFocus
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-lg font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Tanggal</label>
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
        </div>
      </div>

      {kind === "masuk" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">
            Venture / sumber <span className="text-slate-400">(opsional)</span>
          </label>
          <input
            value={venture}
            onChange={(e) => setVenture(e.target.value)}
            placeholder="mis. Belajar AI, jasa editing, affiliate…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">
          Catatan <span className="text-slate-400">(opsional)</span>
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl border border-slate-200 px-5 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
