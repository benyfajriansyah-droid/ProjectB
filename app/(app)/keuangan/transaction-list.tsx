"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRupiah, type Transaction } from "@/lib/money";
import { IconClose } from "@/components/icons";

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
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">Riwayat</h2>
        <p className="rounded-xl border border-hairline bg-surface p-6 text-center text-[13px] text-ink-faint">
          Belum ada transaksi tercatat.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">Riwayat</h2>
      <div className="divide-y divide-rule overflow-hidden rounded-xl border border-hairline bg-surface">
        {transactions.map((tx) => (
          <div key={tx.id} className="group flex items-center gap-3 px-4 py-3">
            <span
              className={`h-8 w-1 shrink-0 rounded-full ${tx.kind === "masuk" ? "bg-[#0ca30c]" : "bg-[#d03b3b]"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium leading-snug text-ink">{tx.category}</div>
              <div className="mt-0.5 truncate text-[11px] text-ink-faint">
                {formatDay(tx.occurredOn)}
                {tx.venture && ` · ${tx.venture}`}
                {tx.note && ` · ${tx.note}`}
              </div>
            </div>
            <span
              className={`shrink-0 text-[13px] font-semibold tabular-nums ${tx.kind === "masuk" ? "text-[#0a7d0a]" : "text-[#a33030]"}`}
            >
              {tx.kind === "masuk" ? "+" : "−"}
              {formatRupiah(tx.amount)}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              disabled={deleting === tx.id}
              aria-label="Hapus transaksi"
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-ink-faint transition hover:bg-[#fdf0f0] hover:text-critical disabled:opacity-50"
            >
              <IconClose size={13} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
