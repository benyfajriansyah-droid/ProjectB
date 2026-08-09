import { notFound } from "next/navigation";
import { getIdea } from "@/lib/ideas";
import { temaLabel } from "@/lib/constants";
import IdeaEditor from "./idea-editor";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{idea.hook}</h1>
        <p className="text-sm text-white/50">{temaLabel(idea.tema)}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {idea.rawText}
      </div>

      <IdeaEditor idea={idea} />
    </div>
  );
}
