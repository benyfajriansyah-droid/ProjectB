import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdea } from "@/lib/ideas";
import { listThemes } from "@/lib/accounts";
import { Card, TemaDot } from "@/components/ui";
import IdeaEditor from "./idea-editor";

export const dynamic = "force-dynamic";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [idea, themes] = await Promise.all([getIdea(id), listThemes()]);
  if (!idea) notFound();

  const t = themes.find((x) => x.key === idea.tema);

  return (
    <>
      <Link
        href="/konten"
        className="mb-4 inline-block text-[12px] text-ink-muted transition-colors hover:text-ink"
      >
        ← Konten
      </Link>

      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-rule px-5 py-2.5">
            <TemaDot color={t?.color ?? "#8a8880"} size={8} />
            <span className="text-[12px] font-medium text-ink-secondary">
              {t?.label ?? idea.tema}
            </span>
          </div>

          <div className="px-5 py-4">
            <h1 className="text-[19px] font-semibold leading-snug tracking-tightish text-ink">
              {idea.hook}
            </h1>
            <p className="mt-3 rounded-lg bg-plane px-3.5 py-3 text-[13px] leading-relaxed text-ink-secondary">
              {idea.rawText}
            </p>
          </div>
        </Card>

        <IdeaEditor idea={idea} />
      </div>
    </>
  );
}
