import Link from "next/link";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { TARGET_BULANAN, formatRupiah, monthlySummaries } from "@/lib/finance";
import { accountStates, delta, listSnapshots } from "@/lib/social";
import { listIdeas } from "@/lib/ideas";
import { getCachedBriefing } from "@/lib/briefing";
import { getMarkets, getNews } from "@/lib/feeds";
import { PLATFORM_LABELS, temaLabel } from "@/lib/constants";
import BriefingCard from "./briefing-card";

export const dynamic = "force-dynamic";

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-violet-600 transition hover:text-violet-800">
            {linkLabel ?? "Lihat semua"} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  if (!isDbConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="whitespace-pre-line rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {MISSING_DATABASE_MESSAGE}
        </p>
      </div>
    );
  }

  // News and markets reach the open internet; they must never hold up or break
  // the rest of the page, so failures resolve to empty lists inside the lib.
  const [months, snapshots, ideas, briefing, news, markets] = await Promise.all([
    monthlySummaries(1),
    listSnapshots(60),
    listIdeas(),
    getCachedBriefing(),
    getNews(3),
    getMarkets(),
  ]);

  const current = months[0] ?? { month: "", masuk: 0, keluar: 0, bersih: 0 };
  const progress = Math.min((current.masuk / TARGET_BULANAN) * 100, 100);
  const sisa = Math.max(TARGET_BULANAN - current.masuk, 0);

  const states = [...accountStates(snapshots).values()].filter((s) => s.latest);
  const executions = ideas.flatMap((i) => i.executions);
  const perluDigarap = executions.filter(
    (e) => e.status === "draft" || e.status === "terjadwal",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <BriefingCard initial={briefing?.body ?? null} />

      <Panel title="Target 10 juta bulan ini" href="/keuangan" linkLabel="Catat transaksi">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="text-2xl font-bold text-slate-900">{formatRupiah(current.masuk)}</div>
            <div className="text-xs text-slate-500">dari {formatRupiah(TARGET_BULANAN)}</div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="font-medium text-violet-700">{progress.toFixed(0)}%</span>
            <span className="text-slate-500">
              {sisa === 0 ? "🎉 Target tercapai!" : `kurang ${formatRupiah(sisa)}`}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs">
            <div>
              <div className="text-slate-400">Masuk</div>
              <div className="font-semibold text-emerald-600">{formatRupiah(current.masuk)}</div>
            </div>
            <div>
              <div className="text-slate-400">Keluar</div>
              <div className="font-semibold text-rose-600">{formatRupiah(current.keluar)}</div>
            </div>
            <div>
              <div className="text-slate-400">Bersih</div>
              <div className="font-semibold text-slate-900">{formatRupiah(current.bersih)}</div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 sm:grid-cols-2">
        <Panel title="Konten" href="/konten">
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total ide</span>
              <span className="font-semibold text-slate-900">{ideas.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Lagi dikerjain</span>
              <span className="font-semibold text-amber-600">{perluDigarap}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sudah tayang</span>
              <span className="font-semibold text-emerald-600">
                {executions.filter((e) => e.status === "tayang").length}
              </span>
            </div>
            <Link
              href="/capture"
              className="mt-2 block rounded-lg bg-slate-900 py-2 text-center text-xs font-medium text-white transition hover:bg-slate-700"
            >
              + Ide baru
            </Link>
          </div>
        </Panel>

        <Panel title="Sosmed" href="/sosmed">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {states.length === 0 ? (
              <p className="text-sm text-slate-400">
                Belum ada angka tercatat.{" "}
                <Link href="/sosmed" className="text-violet-600 hover:underline">
                  Catat sekarang
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {states.slice(0, 5).map((state) => {
                  const change = delta(
                    state.latest?.followers ?? null,
                    state.previous?.followers ?? null,
                  );
                  return (
                    <div
                      key={`${state.tema}:${state.platform}`}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate text-slate-600">
                        {temaLabel(state.tema)}
                        <span className="ml-1 text-xs text-slate-400">
                          {PLATFORM_LABELS[state.platform]}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {state.latest?.followers?.toLocaleString("id-ID") ?? "—"}
                        </span>
                        {change !== null && change !== 0 && (
                          <span
                            className={`text-xs font-medium ${change > 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {change > 0 ? "▲" : "▼"}
                            {Math.abs(change).toLocaleString("id-ID")}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {markets.length > 0 && (
        <Panel title="Pasar">
          <div className="grid grid-cols-3 gap-3">
            {markets.map((rate) => (
              <div key={rate.label} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-400">{rate.label}</div>
                <div className="text-sm font-bold text-slate-900">{rate.value}</div>
                {rate.change !== null && (
                  <div
                    className={`text-xs font-medium ${rate.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {rate.change >= 0 ? "▲" : "▼"} {Math.abs(rate.change).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {news.length > 0 && (
        <Panel title="Berita hari ini">
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {news.slice(0, 8).map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="text-sm leading-snug text-slate-700">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{item.source}</div>
              </a>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
