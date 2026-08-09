import Link from "next/link";
import { listIdeas } from "@/lib/ideas";
import { TEMAS, STATUS_LABELS, type Status } from "@/lib/constants";

const STATUS_STYLES: Record<Status, string> = {
  ide_baru: "bg-white/10 text-white/70",
  draft: "bg-yellow-500/20 text-yellow-300",
  terjadwal: "bg-blue-500/20 text-blue-300",
  tayang: "bg-green-500/20 text-green-300",
  skip: "bg-white/5 text-white/40 line-through",
};

export default async function DashboardPage() {
  const ideas = await listIdeas();

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {TEMAS.map((tema) => {
        const temaIdeas = ideas.filter((idea) => idea.tema === tema.id);

        return (
          <section key={tema.id} className="space-y-3">
            <h2 className="text-sm font-medium text-white/70">{tema.label}</h2>

            {temaIdeas.length === 0 ? (
              <p className="text-sm text-white/30">Belum ada ide.</p>
            ) : (
              <div className="grid gap-2">
                {temaIdeas.map((idea) => (
                  <Link
                    key={idea.id}
                    href={`/idea/${idea.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:border-white/30"
                  >
                    <span className="text-sm">{idea.hook}</span>
                    <span className="flex gap-2">
                      {idea.executions.map((exec) => (
                        <span
                          key={exec.id}
                          className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[exec.status]}`}
                        >
                          {exec.platform.toUpperCase()}: {STATUS_LABELS[exec.status]}
                        </span>
                      ))}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
