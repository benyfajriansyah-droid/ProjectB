import {
  TARGET_BULANAN,
  formatMonth,
  formatRupiah,
  listTransactions,
  monthlySummaries,
  ventureTotalsThisMonth,
} from "@/lib/finance";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { computePace } from "@/lib/insights";
import { Card, EmptyNote, PageTitle, SectionHead } from "@/components/ui";
import { BarRows, Meter } from "@/components/charts";
import { IconArrowDown, IconArrowUp } from "@/components/icons";
import TransactionForm from "./transaction-form";
import TransactionList from "./transaction-list";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Keuangan" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const [months, ventures, transactions] = await Promise.all([
    monthlySummaries(6),
    ventureTotalsThisMonth(),
    listTransactions(80),
  ]);

  const current = months[0];
  const masuk = current?.masuk ?? 0;
  const pace = computePace(current);
  const percent = (masuk / TARGET_BULANAN) * 100;
  const maxVenture = Math.max(...ventures.map((v) => v.masuk), 1);

  return (
    <>
      <PageTitle title="Keuangan" subtitle="Pemasukan, pengeluaran, dan laju ke target." />

      <div className="space-y-7">
        <Card className="p-5">
          <div className="grid grid-cols-[1fr_auto] items-end gap-x-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                Pemasukan bulan ini
              </div>
              <div className="mt-1 text-[30px] font-semibold leading-none tracking-tightish text-ink">
                {formatRupiah(masuk)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-semibold tabular-nums text-ink">
                {percent.toFixed(0)}%
              </div>
              <div className="text-[12px] text-ink-muted">dari {formatRupiah(TARGET_BULANAN)}</div>
            </div>
          </div>

          <div className="mt-3.5">
            <Meter percent={percent} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-rule pt-3.5 sm:grid-cols-4">
            <div>
              <div className="text-[11px] text-ink-muted">Keluar</div>
              <div className="text-[13px] font-medium tabular-nums text-ink">
                {formatRupiah(current?.keluar ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-ink-muted">Bersih</div>
              <div className="text-[13px] font-medium tabular-nums text-ink">
                {formatRupiah(current?.bersih ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-ink-muted">Harusnya sekarang</div>
              <div className="text-[13px] font-medium tabular-nums text-ink-secondary">
                {formatRupiah(pace.expectedByNow)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-ink-muted">Proyeksi akhir bulan</div>
              <div
                className="flex items-center gap-1 text-[13px] font-medium tabular-nums"
                style={{ color: pace.onTrack ? "#0a7d0a" : "#a33030" }}
              >
                {pace.onTrack ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
                {formatRupiah(pace.projected)}
              </div>
            </div>
          </div>
        </Card>

        <TransactionForm />

        {months.length > 0 && (
          <section>
            <SectionHead title="Pemasukan per bulan" meta="target = garis abu" />
            <Card className="p-4">
              <BarRows
                reference={TARGET_BULANAN}
                referenceLabel="target"
                rows={months.map((m) => ({
                  label: formatMonth(m.month),
                  value: m.masuk,
                  display: formatRupiah(m.masuk),
                }))}
              />
            </Card>
          </section>
        )}

        {ventures.length > 0 && (
          <section>
            <SectionHead title="Sumber pemasukan bulan ini" />
            <Card className="p-4">
              <div className="space-y-2.5">
                {ventures.map((v) => (
                  <div key={v.venture}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-[13px] text-ink">{v.venture}</span>
                      <span className="shrink-0 text-[12px] font-medium tabular-nums text-ink-secondary">
                        {formatRupiah(v.masuk)}
                      </span>
                    </div>
                    <span
                      className="mt-1 block h-1 overflow-hidden rounded-full"
                      style={{ backgroundColor: "#f2f1ec" }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(v.masuk / maxVenture) * 100}%`,
                          backgroundColor: "#2a78d6",
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        <TransactionList transactions={transactions} />
      </div>
    </>
  );
}
