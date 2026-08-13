import Link from "next/link";
import { listIdeas, type Idea } from "@/lib/ideas";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { listThemes, type Theme } from "@/lib/accounts";
import { relativeDay } from "@/lib/insights";
import { Card, EmptyNote, PageTitle, SectionHead, StatusChip, TemaDot } from "@/components/ui";
import { IconCalendar } from "@/components/icons";

export const dynamic = "force-dynamic";

function nextDate(idea: Idea): string | null {
  const dates = idea.executions
    .filter((e) => e.status === "draft" || e.status === "terjadwal")
    .map((e) => e.scheduledAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] ?? null;
}

function IdeaRow({ idea, color }: { idea: Idea; color: string }) {
  const date = nextDate(idea);

  return (
    <Link
      href={`/idea/${idea.id}`}
      className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-plane"
    >
      <span className="mt-1.5">
        <TemaDot color={color} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-snug text-ink">{idea.hook}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {idea.executions.map((exec) => (
            <StatusChip key={exec.id} platform={exec.platform} status={exec.status} />
          ))}
          {date && (
            <span className="flex items-center gap-1 text-[11px] text-ink-faint">
              <IconCalendar size={11} />
              {relativeDay(date)}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

export default async function KontenPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Konten" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const [ideas, themes] = await Promise.all([listIdeas(), listThemes()]);
  const colorOf = (key: string) => themes.find((t) => t.key === key)?.color ?? "#8a8880";

  if (ideas.length === 0) {
    return (
      <>
        <PageTitle title="Konten" />
        <Card className="px-6 py-12 text-center">
          <h2 className="text-[15px] font-semibold text-ink">Belum ada ide tersimpan</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-muted">
            Lempar ide mentah apa adanya — nggak usah rapi. AI yang beresin tema, platform, dan
            formatnya.
          </p>
          <Link
            href="/capture"
            className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Tulis ide pertama
          </Link>
        </Card>
      </>
    );
  }

  const inProgress = ideas
    .filter((i) => i.executions.some((e) => e.status === "draft" || e.status === "terjadwal"))
    .sort((a, b) => (nextDate(a) ?? "9999").localeCompare(nextDate(b) ?? "9999"));
  const fresh = ideas.filter((i) => i.executions.every((e) => e.status === "ide_baru"));

  return (
    <>
      <PageTitle title="Konten" subtitle={`${ideas.length} ide di ${themes.length} tema`} />

      <div className="space-y-7">
        {inProgress.length > 0 && (
          <section>
            <SectionHead title="Lagi dikerjain" meta={`${inProgress.length} ide`} />
            <Card>
              <ul className="divide-y divide-rule">
                {inProgress.map((idea) => (
                  <li key={idea.id}>
                    <IdeaRow idea={idea} color={colorOf(idea.tema)} />
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        {fresh.length > 0 && (
          <section>
            <SectionHead title="Belum diproses" meta={`${fresh.length} ide`} />
            <Card>
              <ul className="divide-y divide-rule">
                {fresh.map((idea) => (
                  <li key={idea.id}>
                    <IdeaRow idea={idea} color={colorOf(idea.tema)} />
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        <section>
          <SectionHead title="Per tema" />
          <div className="grid gap-3 lg:grid-cols-2">
            {themes.map((t) => {
              const temaIdeas = ideas.filter((i) => i.tema === t.key);
              const live = temaIdeas
                .flatMap((i) => i.executions)
                .filter((e) => e.status === "tayang").length;

              return (
                <Card key={t.key} className="overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
                    <TemaDot color={t.color} size={8} />
                    <span className="text-[13px] font-medium text-ink">{t.label}</span>
                    <span className="ml-auto text-[11px] tabular-nums text-ink-faint">
                      {temaIdeas.length} ide · {live} tayang
                    </span>
                  </div>

                  {temaIdeas.length === 0 ? (
                    <EmptyNote>Belum ada ide.</EmptyNote>
                  ) : (
                    <ul className="divide-y divide-rule">
                      {temaIdeas.slice(0, 4).map((idea) => (
                        <li key={idea.id}>
                          <Link
                            href={`/idea/${idea.id}`}
                            className="block px-4 py-2.5 transition-colors hover:bg-plane"
                          >
                            <div className="text-[13px] leading-snug text-ink">{idea.hook}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {idea.executions.map((exec) => (
                                <StatusChip
                                  key={exec.id}
                                  platform={exec.platform}
                                  status={exec.status}
                                />
                              ))}
                            </div>
                          </Link>
                        </li>
                      ))}
                      {temaIdeas.length > 4 && (
                        <li className="px-4 py-2 text-[11px] text-ink-faint">
                          +{temaIdeas.length - 4} ide lainnya
                        </li>
                      )}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
