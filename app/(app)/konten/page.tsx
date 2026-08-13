import Link from "next/link";
import { listIdeas, type Idea } from "@/lib/ideas";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { TEMAS, tema, type Status } from "@/lib/constants";
import StatusChip from "../status-chip";

// Ide berubah tiap kali capture/status di-update, jadi dashboard harus dibaca
// ulang tiap request — bukan di-prerender sekali saat build.
export const dynamic = "force-dynamic";

const STAT_TILES: { status: Status; label: string; className: string }[] = [
  { status: "ide_baru", label: "Ide baru", className: "bg-slate-50 text-slate-700 border-slate-200" },
  { status: "draft", label: "Draft", className: "bg-amber-50 text-amber-800 border-amber-200" },
  { status: "terjadwal", label: "Terjadwal", className: "bg-blue-50 text-blue-800 border-blue-200" },
  { status: "tayang", label: "Tayang", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
];

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/** Earliest scheduled date among the executions still being worked on. */
function nextDate(idea: Idea): string | null {
  const dates = idea.executions
    .filter((e) => e.status === "draft" || e.status === "terjadwal")
    .map((e) => e.scheduledAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] ?? null;
}

function IdeaRow({ idea }: { idea: Idea }) {
  const accent = tema(idea.tema)?.accent;
  const date = formatDate(nextDate(idea));

  return (
    <Link
      href={`/idea/${idea.id}`}
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent?.dot ?? "bg-slate-400"}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{idea.hook}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {idea.executions.map((exec) => (
            <StatusChip key={exec.id} platform={exec.platform} status={exec.status} />
          ))}
          {date && (
            <span className="text-[11px] text-slate-400">📅 {date}</span>
          )}
        </span>
      </span>
    </Link>
  );
}

export default async function KontenPage() {
  if (!isDbConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Konten</h1>
        <p className="whitespace-pre-line rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {MISSING_DATABASE_MESSAGE}
        </p>
      </div>
    );
  }

  const ideas = await listIdeas();
  const executions = ideas.flatMap((i) => i.executions);

  const counts = STAT_TILES.map((tile) => ({
    ...tile,
    count: executions.filter((e) => e.status === tile.status).length,
  }));

  // What's mid-flight: started but not published yet.
  const inProgress = ideas
    .filter((i) => i.executions.some((e) => e.status === "draft" || e.status === "terjadwal"))
    .sort((a, b) => (nextDate(a) ?? "9999").localeCompare(nextDate(b) ?? "9999"));

  const fresh = ideas.filter((i) => i.executions.every((e) => e.status === "ide_baru"));

  if (ideas.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-900">Konten</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl">
            ✨
          </div>
          <h2 className="text-base font-semibold text-slate-800">Belum ada ide tersimpan</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Lempar ide mentah apa adanya — nggak usah rapi. AI yang beresin temanya,
            platformnya, dan formatnya.
          </p>
          <Link
            href="/capture"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Tulis ide pertama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Konten</h1>
          <p className="text-sm text-slate-500">
            {ideas.length} ide di {TEMAS.length} tema
          </p>
        </div>
        <Link
          href="/capture"
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Ide baru
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map((tile) => (
          <div key={tile.status} className={`rounded-xl border p-3 ${tile.className}`}>
            <div className="text-2xl font-bold leading-none">{tile.count}</div>
            <div className="mt-1 text-xs font-medium opacity-80">{tile.label}</div>
          </div>
        ))}
      </div>

      {inProgress.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Lagi dikerjain</h2>
            <span className="text-xs text-slate-400">{inProgress.length} ide</span>
          </div>
          <div className="grid gap-2">
            {inProgress.map((idea) => (
              <IdeaRow key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      )}

      {fresh.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Belum diproses</h2>
            <span className="text-xs text-slate-400">{fresh.length} ide</span>
          </div>
          <div className="grid gap-2">
            {fresh.map((idea) => (
              <IdeaRow key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Per tema</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMAS.map((t) => {
            const temaIdeas = ideas.filter((i) => i.tema === t.id);
            const live = temaIdeas.flatMap((i) => i.executions).filter((e) => e.status === "tayang").length;

            return (
              <div
                key={t.id}
                className={`overflow-hidden rounded-xl border bg-white ${t.accent.border}`}
              >
                <div className={`flex items-center gap-2 px-4 py-2.5 ${t.accent.softBg}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${t.accent.dot}`} />
                  <span className={`text-sm font-semibold ${t.accent.chipText}`}>{t.label}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {temaIdeas.length} ide · {live} tayang
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {temaIdeas.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400">Belum ada ide.</p>
                  ) : (
                    temaIdeas.slice(0, 4).map((idea) => (
                      <Link
                        key={idea.id}
                        href={`/idea/${idea.id}`}
                        className="block px-4 py-2.5 transition hover:bg-slate-50"
                      >
                        <div className="text-sm text-slate-700">{idea.hook}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {idea.executions.map((exec) => (
                            <StatusChip key={exec.id} platform={exec.platform} status={exec.status} />
                          ))}
                        </div>
                      </Link>
                    ))
                  )}
                  {temaIdeas.length > 4 && (
                    <p className="px-4 py-2 text-xs text-slate-400">
                      +{temaIdeas.length - 4} ide lainnya
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
