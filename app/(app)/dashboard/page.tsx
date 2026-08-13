import { Suspense } from "react";
import Link from "next/link";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { TARGET_BULANAN, formatRupiah, monthlySummaries } from "@/lib/finance";
import { accountStates, delta, listSnapshots } from "@/lib/social";
import { listIdeas } from "@/lib/ideas";
import { getMarkets, getNews } from "@/lib/feeds";
import { computePace, overdue, relativeDay, weekAhead } from "@/lib/insights";
import { PLATFORM_LABELS, PLATFORM_SHORT } from "@/lib/constants";
import { listThemes } from "@/lib/accounts";
import { Card, EmptyNote, PageTitle, SectionHead, StatusChip, TemaDot } from "@/components/ui";
import { Meter, Sparkline } from "@/components/charts";
import { IconAlert, IconArrowDown, IconArrowUp, IconCalendar } from "@/components/icons";
import BriefingSection, { BriefingSkeleton } from "./briefing-section";

export const dynamic = "force-dynamic";

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(value);
}

export default async function DashboardPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Dashboard" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const [months, snapshots, ideas, news, markets, themes] = await Promise.all([
    monthlySummaries(1),
    listSnapshots(120),
    listIdeas(),
    getNews(3),
    getMarkets(),
    listThemes(),
  ]);

  const colorOf = (key: string) => themes.find((t) => t.key === key)?.color ?? "#8a8880";
  const labelOf = (key: string) => themes.find((t) => t.key === key)?.label ?? key;

  const current = months[0];
  const masuk = current?.masuk ?? 0;
  const pace = computePace(current);
  const percent = (masuk / TARGET_BULANAN) * 100;
  const sisa = Math.max(TARGET_BULANAN - masuk, 0);

  const states = [...accountStates(snapshots).values()].filter((s) => s.latest);
  const executions = ideas.flatMap((i) => i.executions);
  const telat = overdue(ideas);
  const mingguIni = weekAhead(ideas);

  const historyFor = (tema: string, platform: string) =>
    snapshots
      .filter((s) => s.tema === tema && s.platform === platform && s.followers !== null)
      .sort((a, b) => a.recordedOn.localeCompare(b.recordedOn))
      .map((s) => s.followers as number);

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      <div className="space-y-7">
        <Suspense fallback={<BriefingSkeleton />}>
          <BriefingSection />
        </Suspense>

        {telat.length > 0 && (
          <Card className="border-critical/30 bg-[#fdf0f0]">
            <div className="flex items-start gap-2.5 px-4 py-3">
              <IconAlert size={16} className="mt-0.5 shrink-0 text-critical" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#8f2727]">
                  {telat.length} konten lewat tanggal tayang
                </p>
                <ul className="mt-1.5 space-y-1">
                  {telat.slice(0, 3).map(({ idea, execution, date }) => (
                    <li key={execution.id} className="flex items-baseline gap-2 text-[12px]">
                      <Link
                        href={`/idea/${idea.id}`}
                        className="min-w-0 truncate text-[#8f2727] underline-offset-2 hover:underline"
                      >
                        {idea.hook}
                      </Link>
                      <span className="shrink-0 text-[11px] text-[#b06060]">
                        {PLATFORM_LABELS[execution.platform]} · {relativeDay(date)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <section>
          <SectionHead title="Target bulan ini" href="/keuangan" hrefLabel="Catat transaksi" />
          <Card className="p-5">
            <div className="grid grid-cols-[1fr_auto] items-end gap-x-4">
              <div>
                <div className="text-[28px] font-semibold leading-none tracking-tightish text-ink">
                  {formatRupiah(masuk)}
                </div>
                <div className="mt-1.5 text-[12px] text-ink-muted">
                  dari {formatRupiah(TARGET_BULANAN)} · hari ke-{pace.dayOfMonth} dari{" "}
                  {pace.daysInMonth}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold tabular-nums text-ink">
                  {percent.toFixed(0)}%
                </div>
                <div className="whitespace-nowrap text-[12px] text-ink-muted">
                  {sisa === 0 ? "target tercapai" : `kurang ${compact(sisa)}`}
                </div>
              </div>
            </div>

            <div className="mt-3.5">
              <Meter percent={percent} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-rule pt-3.5 sm:grid-cols-4">
              <div>
                <div className="text-[11px] text-ink-muted">Masuk</div>
                <div className="text-[13px] font-medium tabular-nums text-ink">
                  {formatRupiah(masuk)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-muted">Keluar</div>
                <div className="text-[13px] font-medium tabular-nums text-ink">
                  {formatRupiah(current?.keluar ?? 0)}
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

            {!pace.onTrack && masuk > 0 && (
              <p className="mt-3 text-[12px] leading-relaxed text-ink-secondary">
                Dengan laju sekarang, akhir bulan ada di {formatRupiah(pace.projected)} — tertinggal{" "}
                {formatRupiah(pace.shortfall)} dari seharusnya hari ini.
              </p>
            )}
          </Card>
        </section>

        <div className="grid gap-7 lg:grid-cols-2">
          <section>
            <SectionHead
              title="Minggu ini"
              meta={mingguIni.length > 0 ? `${mingguIni.length} jadwal` : undefined}
              href="/konten"
            />
            <Card>
              {mingguIni.length === 0 ? (
                <EmptyNote>
                  Belum ada konten terjadwal 7 hari ke depan. Buka satu ide lalu isi tanggal
                  tayangnya.
                </EmptyNote>
              ) : (
                <ul className="divide-y divide-rule">
                  {mingguIni.slice(0, 6).map(({ idea, execution, date }) => (
                    <li key={execution.id}>
                      <Link
                        href={`/idea/${idea.id}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-plane"
                      >
                        <TemaDot color={colorOf(idea.tema)} />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                          {idea.hook}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-ink-muted">
                          <span className="text-ink-faint">
                            {PLATFORM_SHORT[execution.platform]}
                          </span>
                          <IconCalendar size={12} />
                          {relativeDay(date)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section>
            <SectionHead title="Konten" href="/konten" />
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total ide", value: ideas.length },
                  {
                    label: "Dikerjain",
                    value: executions.filter(
                      (e) => e.status === "draft" || e.status === "terjadwal",
                    ).length,
                  },
                  {
                    label: "Tayang",
                    value: executions.filter((e) => e.status === "tayang").length,
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[20px] font-semibold leading-none tabular-nums text-ink">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/capture"
                className="mt-4 block rounded-lg bg-ink py-2 text-center text-[12px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Tulis ide baru
              </Link>
            </Card>
          </section>
        </div>

        <section>
          <SectionHead title="Sosmed" href="/sosmed" />
          <Card>
            {states.length === 0 ? (
              <EmptyNote>
                Belum ada angka tercatat.{" "}
                <Link href="/sosmed" className="text-ink underline underline-offset-2">
                  Catat sekarang
                </Link>
              </EmptyNote>
            ) : (
              <ul className="divide-y divide-rule">
                {states.slice(0, 6).map((state) => {
                  const change = delta(
                    state.latest?.followers ?? null,
                    state.previous?.followers ?? null,
                  );
                  return (
                    <li
                      key={`${state.tema}:${state.platform}`}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <TemaDot color={colorOf(state.tema)} />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                        {labelOf(state.tema)}
                      </span>
                      <span className="w-6 shrink-0 text-[11px] font-medium text-ink-muted">
                        {PLATFORM_SHORT[state.platform]}
                      </span>

                      <span className="hidden sm:block">
                        <Sparkline values={historyFor(state.tema, state.platform)} />
                      </span>

                      <span className="w-16 shrink-0 text-right text-[13px] font-medium tabular-nums text-ink">
                        {state.latest?.followers?.toLocaleString("id-ID") ?? "—"}
                      </span>
                      <span className="w-14 shrink-0 text-right text-[11px] font-medium tabular-nums">
                        {change === null || change === 0 ? (
                          <span className="text-ink-faint">—</span>
                        ) : (
                          <span style={{ color: change > 0 ? "#0a7d0a" : "#a33030" }}>
                            {change > 0 ? "+" : "−"}
                            {Math.abs(change).toLocaleString("id-ID")}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        {markets.length > 0 && (
          <section>
            <SectionHead title="Pasar" />
            <div className="grid grid-cols-3 gap-3">
              {markets.map((rate) => (
                <Card key={rate.label} className="p-3.5">
                  <div className="text-[11px] text-ink-muted">{rate.label}</div>
                  <div className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">
                    {rate.value}
                  </div>
                  {rate.change !== null && (
                    <div
                      className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium tabular-nums"
                      style={{ color: rate.change >= 0 ? "#0a7d0a" : "#a33030" }}
                    >
                      {rate.change >= 0 ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />}
                      {Math.abs(rate.change).toFixed(1)}%
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {news.length > 0 && (
          <section>
            <SectionHead title="Berita" />
            <Card>
              <ul className="divide-y divide-rule">
                {news.slice(0, 7).map((item) => (
                  <li key={item.link}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 transition-colors hover:bg-plane"
                    >
                      <div className="text-[13px] leading-snug text-ink">{item.title}</div>
                      <div className="mt-0.5 text-[11px] text-ink-faint">{item.source}</div>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}
      </div>
    </>
  );
}
