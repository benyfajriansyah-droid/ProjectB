"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KATEGORI_KELUAR, KATEGORI_MASUK, type TxKind } from "@/lib/money";

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
        className="w-full rounded-xl border border-dashed border-ink-faint py-4 text-sm font-medium text-ink-muted transition hover:border-ink-muted hover:bg-plane hover:text-ink"
      >
        + Catat transaksi
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
      <div className="grid grid-cols-2 gap-2">
        {(["masuk", "keluar"] as const).map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              kind === k
                ? k === "masuk"
                  ? "bg-[#0a7d0a] text-white"
                  : "bg-[#a33030] text-white"
                : "bg-plane text-ink-muted hover:bg-plane"
            }`}
          >
            {k === "masuk" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">Nominal</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-faint">Rp</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(formatThousands(e.target.value))}
            placeholder="0"
            autoFocus
            className="w-full rounded-xl border border-hairline py-3 pl-10 pr-4 text-lg font-semibold text-ink outline-none transition focus:border-ink-muted "
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none focus:border-ink-muted"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">Tanggal</label>
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none focus:border-ink-muted"
          />
        </div>
      </div>

      {kind === "masuk" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">
            Venture / sumber <span className="text-ink-faint">(opsional)</span>
          </label>
          <input
            value={venture}
            onChange={(e) => setVenture(e.target.value)}
            placeholder="mis. Belajar AI, jasa editing, affiliate…"
            className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none focus:border-ink-muted"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">
          Catatan <span className="text-ink-faint">(opsional)</span>
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none focus:border-ink-muted"
        />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl border border-hairline px-5 text-sm text-ink-secondary transition hover:bg-plane"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
