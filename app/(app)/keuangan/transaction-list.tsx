"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRupiah, type Transaction } from "@/lib/finance";

function formatDay(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Riwayat</h2>
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
          Belum ada transaksi tercatat.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">Riwayat</h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {transactions.map((tx) => (
          <div key={tx.id} className="group flex items-center gap-3 px-4 py-3">
            <span
              className={`h-8 w-1 shrink-0 rounded-full ${tx.kind === "masuk" ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-800">{tx.category}</div>
              <div className="truncate text-xs text-slate-400">
                {formatDay(tx.occurredOn)}
                {tx.venture && ` · ${tx.venture}`}
                {tx.note && ` · ${tx.note}`}
              </div>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold ${tx.kind === "masuk" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {tx.kind === "masuk" ? "+" : "−"}
              {formatRupiah(tx.amount)}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              disabled={deleting === tx.id}
              aria-label="Hapus transaksi"
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
