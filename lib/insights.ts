import { TARGET_BULANAN, type MonthSummary } from "./money";
import type { Idea, PlatformExecution } from "./ideas";

/** Today in Jakarta, as YYYY-MM-DD. */
export function todayJakarta(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export type Pace = {
  dayOfMonth: number;
  daysInMonth: number;
  /** Where income should stand today to finish the month on target. */
  expectedByNow: number;
  /** Month-end total if the current daily rate holds. */
  projected: number;
  onTrack: boolean;
  shortfall: number;
};

/**
 * Progress alone can't tell you whether you're behind — 4 juta is fine on the
 * 10th and a problem on the 28th. This compares against elapsed time.
 */
export function computePace(current: MonthSummary | undefined): Pace {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const dayOfMonth = now.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();

  const masuk = current?.masuk ?? 0;
  const expectedByNow = Math.round((TARGET_BULANAN / daysInMonth) * dayOfMonth);
  const projected = Math.round((masuk / dayOfMonth) * daysInMonth);

  return {
    dayOfMonth,
    daysInMonth,
    expectedByNow,
    projected,
    onTrack: masuk >= expectedByNow,
    shortfall: Math.max(expectedByNow - masuk, 0),
  };
}

export type ScheduledItem = {
  idea: Idea;
  execution: PlatformExecution;
  date: string;
};

function scheduledItems(ideas: Idea[]): ScheduledItem[] {
  const items: ScheduledItem[] = [];
  for (const idea of ideas) {
    for (const execution of idea.executions) {
      if (!execution.scheduledAt) continue;
      if (execution.status === "tayang" || execution.status === "skip") continue;
      items.push({ idea, execution, date: execution.scheduledAt });
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

/** Scheduled for the next seven days, today included. */
export function weekAhead(ideas: Idea[]): ScheduledItem[] {
  const today = todayJakarta();
  const limit = new Date(Date.now() + 7 * 60 * 60 * 1000 + 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return scheduledItems(ideas).filter((i) => i.date >= today && i.date <= limit);
}

/** Publish date has passed and it still isn't live — the thing that quietly slips. */
export function overdue(ideas: Idea[]): ScheduledItem[] {
  const today = todayJakarta();
  return scheduledItems(ideas).filter((i) => i.date < today);
}

export function formatShortDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function relativeDay(value: string): string {
  const today = todayJakarta();
  if (value === today) return "hari ini";

  const diff = Math.round(
    (new Date(`${value}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) /
      86_400_000,
  );
  if (diff === 1) return "besok";
  if (diff > 1) return `${diff} hari lagi`;
  if (diff === -1) return "kemarin";
  return `telat ${Math.abs(diff)} hari`;
}
