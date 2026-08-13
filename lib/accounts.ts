import { query, type Row } from "./db";
import { PALETTE_SLOTS, SEED_ACCOUNTS, type Platform } from "./constants";

export type Account = {
  id: string;
  themeKey: string;
  themeLabel: string;
  platform: Platform;
  handle: string | null;
  color: string;
  sortOrder: number;
};

export type Theme = {
  key: string;
  label: string;
  short: string;
  color: string;
  accounts: Account[];
};

function rowToAccount(row: Row): Account {
  return {
    id: row.id as string,
    themeKey: row.theme_key as string,
    themeLabel: row.theme_label as string,
    platform: row.platform as Platform,
    handle: (row.handle as string | null) ?? null,
    color: row.color as string,
    sortOrder: Number(row.sort_order),
  };
}

/**
 * First run starts from the accounts that were previously hardcoded, so an
 * existing database keeps working and a fresh one isn't empty. Only ever
 * inserts into an empty table — it must not resurrect rows the user deleted.
 */
async function seedIfEmpty(): Promise<void> {
  const [{ count }] = (await query("SELECT count(*)::int AS count FROM accounts")) as {
    count: number;
  }[];
  if (count > 0) return;

  for (const account of SEED_ACCOUNTS) {
    await query(
      `INSERT INTO accounts (id, theme_key, theme_label, platform, handle, color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (theme_key, platform) DO NOTHING`,
      [
        crypto.randomUUID(),
        account.themeKey,
        account.themeLabel,
        account.platform,
        account.handle,
        account.color,
        String(account.sortOrder),
      ],
    );
  }
}

export async function listAccounts(): Promise<Account[]> {
  await seedIfEmpty();
  const rows = await query("SELECT * FROM accounts ORDER BY sort_order, theme_label, platform");
  return rows.map(rowToAccount);
}

/** Accounts grouped into the personas the rest of the app works in terms of. */
export async function listThemes(): Promise<Theme[]> {
  const accounts = await listAccounts();
  const byKey = new Map<string, Theme>();

  for (const account of accounts) {
    const existing = byKey.get(account.themeKey);
    if (existing) {
      existing.accounts.push(account);
      continue;
    }
    byKey.set(account.themeKey, {
      key: account.themeKey,
      label: account.themeLabel,
      short: shortLabel(account.themeLabel),
      color: account.color,
      accounts: [account],
    });
  }

  return [...byKey.values()];
}

/** Two words is enough to recognise a persona on a chip. */
function shortLabel(label: string): string {
  const words = label.split(/\s+/);
  return words.length <= 2 ? label : words.slice(0, 2).join(" ");
}

export function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "tema"
  );
}

/** Next unused palette slot, so a new persona is distinguishable by default. */
export function nextColor(used: string[]): string {
  return PALETTE_SLOTS.find((c) => !used.includes(c)) ?? PALETTE_SLOTS[PALETTE_SLOTS.length - 1];
}

export async function createAccount(input: {
  themeKey: string;
  themeLabel: string;
  platform: Platform;
  handle?: string | null;
  color: string;
}): Promise<void> {
  const [{ max }] = (await query(
    "SELECT COALESCE(MAX(sort_order), 0)::int AS max FROM accounts",
  )) as { max: number }[];

  await query(
    `INSERT INTO accounts (id, theme_key, theme_label, platform, handle, color, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (theme_key, platform)
     DO UPDATE SET handle = EXCLUDED.handle, theme_label = EXCLUDED.theme_label`,
    [
      crypto.randomUUID(),
      input.themeKey,
      input.themeLabel,
      input.platform,
      input.handle || null,
      input.color,
      String(max + 1),
    ],
  );

  // A persona carries one colour and one name across its platforms.
  await query(
    "UPDATE accounts SET theme_label = $1, color = $2 WHERE theme_key = $3",
    [input.themeLabel, input.color, input.themeKey],
  );
}

export async function deleteAccount(id: string): Promise<void> {
  await query("DELETE FROM accounts WHERE id = $1", [id]);
}

export async function renameTheme(themeKey: string, label: string): Promise<void> {
  await query("UPDATE accounts SET theme_label = $1 WHERE theme_key = $2", [label, themeKey]);
}

export async function updateHandle(id: string, handle: string): Promise<void> {
  await query("UPDATE accounts SET handle = $1 WHERE id = $2", [handle || null, id]);
}

/** How many ideas point at a persona — deleting it would orphan them. */
export async function ideaCountByTheme(): Promise<Map<string, number>> {
  const rows = await query("SELECT tema, count(*)::int AS count FROM ideas GROUP BY tema");
  return new Map(rows.map((r) => [r.tema as string, Number(r.count)]));
}
