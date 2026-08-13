import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdea } from "@/lib/ideas";
import { tema } from "@/lib/constants";
import IdeaEditor from "./idea-editor";

export const dynamic = "force-dynamic";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea) notFound();

  const t = tema(idea.tema);

  return (
    <div className="space-y-5">
      <Link
        href="/konten"
        className="inline-block text-sm text-slate-500 transition hover:text-slate-800"
      >
        ← Konten
      </Link>

      <div className={`overflow-hidden rounded-2xl border bg-white ${t?.accent.border ?? "border-slate-200"}`}>
        <div className={`flex items-center gap-2 px-5 py-2.5 ${t?.accent.softBg ?? "bg-slate-50"}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${t?.accent.dot ?? "bg-slate-400"}`} />
          <span className={`text-xs font-semibold ${t?.accent.chipText ?? "text-slate-600"}`}>
            {t?.label ?? idea.tema}
          </span>
        </div>

        <div className="space-y-3 px-5 py-4">
          <h1 className="text-lg font-bold leading-snug text-slate-900">{idea.hook}</h1>
          <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
            {idea.rawText}
          </div>
        </div>
      </div>

      <IdeaEditor idea={idea} />
    </div>
  );
}
