import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { accountStates, delta, listSnapshots } from "@/lib/social";
import { PLATFORM_LABELS, TEMAS, type Platform } from "@/lib/constants";
import { Card, PageTitle, SectionHead, TemaDot } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import SnapshotForm from "./snapshot-form";

export const dynamic = "force-dynamic";

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: number | null;
  change: number | null;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.05em] text-ink-faint">{label}</div>
      <div className="mt-0.5 text-[14px] font-medium tabular-nums text-ink">
        {value === null ? "—" : value.toLocaleString("id-ID")}
      </div>
      <div className="text-[11px] font-medium tabular-nums">
        {change === null || change === 0 ? (
          <span className="text-ink-faint">—</span>
        ) : (
          <span style={{ color: change > 0 ? "#0a7d0a" : "#a33030" }}>
            {change > 0 ? "+" : "−"}
            {Math.abs(change).toLocaleString("id-ID")}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function SosmedPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Sosmed" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const snapshots = await listSnapshots(400);
  const states = accountStates(snapshots);

  const historyFor = (tema: string, platform: string) =>
    snapshots
      .filter((s) => s.tema === tema && s.platform === platform && s.followers !== null)
      .sort((a, b) => a.recordedOn.localeCompare(b.recordedOn))
      .map((s) => s.followers as number);

  return (
    <>
      <PageTitle
        title="Sosmed"
        subtitle="Angka tiap akun dan arah pergerakannya sejak catatan sebelumnya."
      />

      <div className="space-y-7">
        <SnapshotForm />

        <div className="space-y-3">
          {TEMAS.map((t) => {
            const platforms = Object.keys(t.handles) as Platform[];

            return (
              <Card key={t.id} className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
                  <TemaDot color={t.color} size={8} />
                  <span className="text-[13px] font-medium text-ink">{t.label}</span>
                </div>

                <div className="divide-y divide-rule">
                  {platforms.map((platform) => {
                    const state = states.get(`${t.id}:${platform}`);
                    const latest = state?.latest;
                    const previous = state?.previous;
                    const history = historyFor(t.id, platform);

                    return (
                      <div key={platform} className="px-4 py-3">
                        <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[12px] font-medium text-ink-secondary">
                            {PLATFORM_LABELS[platform]}
                          </span>
                          <span className="text-[11px] text-ink-faint">{t.handles[platform]}</span>
                          <span className="ml-auto flex items-center gap-2">
                            <Sparkline values={history} width={72} height={22} />
                            <span className="text-[11px] text-ink-faint">
                              {latest ? latest.recordedOn : "belum ada data"}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <Metric
                            label="Follower"
                            value={latest?.followers ?? null}
                            change={delta(latest?.followers ?? null, previous?.followers ?? null)}
                          />
                          <Metric
                            label="Views"
                            value={latest?.views ?? null}
                            change={delta(latest?.views ?? null, previous?.views ?? null)}
                          />
                          <Metric
                            label="Engagement"
                            value={latest?.engagement ?? null}
                            change={delta(
                              latest?.engagement ?? null,
                              previous?.engagement ?? null,
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        <section>
          <SectionHead title="Kenapa masih manual" />
          <Card className="p-4">
            <p className="text-[12px] leading-relaxed text-ink-secondary">
              <strong className="font-medium text-ink">Instagram</strong> bisa disambungkan otomatis
              tanpa menunggu persetujuan, selama akunnya Business/Creator dan terhubung ke Facebook
              Page. <strong className="font-medium text-ink">TikTok</strong> memerlukan persetujuan
              aplikasi dari pihak TikTok, dan lamanya di luar kendali kita.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Data manual dan data dari API disimpan di tabel yang sama, jadi tampilan ini tidak
              berubah saat penyambungan otomatis nanti aktif.
            </p>
          </Card>
        </section>
      </div>
    </>
  );
}
