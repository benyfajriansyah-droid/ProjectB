import {
  TARGET_BULANAN,
  formatMonth,
  formatRupiah,
  listTransactions,
  monthlySummaries,
  ventureTotalsThisMonth,
} from "@/lib/finance";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import TransactionForm from "./transaction-form";
import TransactionList from "./transaction-list";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  if (!isDbConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Keuangan</h1>
        <p className="whitespace-pre-line rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {MISSING_DATABASE_MESSAGE}
        </p>
      </div>
    );
  }

  const [months, ventures, transactions] = await Promise.all([
    monthlySummaries(6),
    ventureTotalsThisMonth(),
    listTransactions(60),
  ]);

  const current = months[0] ?? { month: "", masuk: 0, keluar: 0, bersih: 0 };
  const progress = Math.min((current.masuk / TARGET_BULANAN) * 100, 100);
  const sisa = Math.max(TARGET_BULANAN - current.masuk, 0);
  const maxMasuk = Math.max(...months.map((m) => m.masuk), TARGET_BULANAN);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Keuangan</h1>
        <p className="text-sm text-slate-500">Pemasukan, pengeluaran, dan progress ke target.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-slate-500">Pemasukan bulan ini</div>
            <div className="text-2xl font-bold text-slate-900">{formatRupiah(current.masuk)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Target</div>
            <div className="text-sm font-semibold text-slate-700">
              {formatRupiah(TARGET_BULANAN)}
            </div>
          </div>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="font-medium text-violet-700">{progress.toFixed(0)}% tercapai</span>
          <span className="text-slate-500">
            {sisa === 0 ? "🎉 Target tercapai!" : `kurang ${formatRupiah(sisa)}`}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div>
            <div className="text-xs text-slate-500">Masuk</div>
            <div className="text-sm font-semibold text-emerald-600">
              {formatRupiah(current.masuk)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Keluar</div>
            <div className="text-sm font-semibold text-rose-600">
              {formatRupiah(current.keluar)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Bersih</div>
            <div
              className={`text-sm font-semibold ${current.bersih >= 0 ? "text-slate-900" : "text-rose-600"}`}
            >
              {formatRupiah(current.bersih)}
            </div>
          </div>
        </div>
      </section>

      <TransactionForm />

      {months.length > 1 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Tren bulanan</h2>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            {months.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-slate-500">
                  {formatMonth(m.month)}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-violet-500"
                    style={{ width: `${maxMasuk ? (m.masuk / maxMasuk) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-28 shrink-0 text-right text-xs font-medium text-slate-700">
                  {formatRupiah(m.masuk)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {ventures.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Sumber pemasukan bulan ini</h2>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {ventures.map((v) => (
              <div key={v.venture} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-700">{v.venture}</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatRupiah(v.masuk)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <TransactionList transactions={transactions} />
    </div>
  );
}
