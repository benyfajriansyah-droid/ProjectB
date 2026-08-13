import { query, type Row } from "./db";
import type { Platform } from "./constants";

export type Snapshot = {
  id: string;
  platform: Platform;
  tema: string;
  followers: number | null;
  views: number | null;
  engagement: number | null;
  source: "manual" | "api";
  recordedOn: string;
};

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function rowToSnapshot(row: Row): Snapshot {
  return {
    id: row.id as string,
    platform: row.platform as Platform,
    tema: row.tema as string,
    followers: row.followers === null ? null : Number(row.followers),
    views: row.views === null ? null : Number(row.views),
    engagement: row.engagement === null ? null : Number(row.engagement),
    source: row.source as "manual" | "api",
    recordedOn: toDateString(row.recorded_on),
  };
}

/**
 * Re-recording the same account and date overwrites rather than duplicating,
 * so a corrected number replaces the wrong one instead of sitting beside it.
 */
export async function saveSnapshot(input: {
  platform: Platform;
  tema: string;
  followers?: number | null;
  views?: number | null;
  engagement?: number | null;
  recordedOn: string;
  source?: "manual" | "api";
}): Promise<void> {
  await query(
    `INSERT INTO social_snapshots
       (id, platform, tema, followers, views, engagement, source, recorded_on)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (platform, tema, recorded_on) DO UPDATE SET
       followers = EXCLUDED.followers,
       views = EXCLUDED.views,
       engagement = EXCLUDED.engagement,
       source = EXCLUDED.source`,
    [
      crypto.randomUUID(),
      input.platform,
      input.tema,
      input.followers ?? null,
      input.views ?? null,
      input.engagement ?? null,
      input.source ?? "manual",
      input.recordedOn,
    ],
  );
}

export async function listSnapshots(limit = 200): Promise<Snapshot[]> {
  const rows = await query(
    "SELECT * FROM social_snapshots ORDER BY recorded_on DESC, platform LIMIT $1",
    [limit],
  );
  return rows.map(rowToSnapshot);
}

export type AccountState = {
  platform: Platform;
  tema: string;
  latest: Snapshot | null;
  previous: Snapshot | null;
};

/** Latest two entries per account, so the panel can show direction of travel. */
export function accountStates(snapshots: Snapshot[]): Map<string, AccountState> {
  const byAccount = new Map<string, Snapshot[]>();

  for (const snap of snapshots) {
    const key = `${snap.tema}:${snap.platform}`;
    const list = byAccount.get(key) ?? [];
    list.push(snap);
    byAccount.set(key, list);
  }

  const states = new Map<string, AccountState>();
  for (const [key, list] of byAccount) {
    const sorted = [...list].sort((a, b) => b.recordedOn.localeCompare(a.recordedOn));
    states.set(key, {
      platform: sorted[0].platform,
      tema: sorted[0].tema,
      latest: sorted[0] ?? null,
      previous: sorted[1] ?? null,
    });
  }
  return states;
}

export function delta(latest: number | null, previous: number | null): number | null {
  if (latest === null || previous === null) return null;
  return latest - previous;
}
