import { buildBriefing } from "@/lib/briefing";
import BriefingCard from "./briefing-card";

/**
 * Writes today's briefing on the first visit of the day, so it is simply there
 * rather than waiting on a click. Rendered inside Suspense: the rest of the
 * dashboard paints immediately and this streams in when the model answers.
 */
export default async function BriefingSection() {
  try {
    const briefing = await buildBriefing();
    return <BriefingCard initial={briefing.body} />;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return <BriefingCard initial={null} initialError={detail} />;
  }
}

export function BriefingSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl bg-ink px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/60">
          Briefing hari ini
        </span>
        <span className="ml-auto text-[11px] text-white/40">menyusun…</span>
      </div>
      <div className="mt-3.5 space-y-2">
        {["92%", "84%", "70%"].map((w) => (
          <span
            key={w}
            className="block h-3 animate-pulse rounded bg-white/10"
            style={{ width: w }}
          />
        ))}
      </div>
    </section>
  );
}
