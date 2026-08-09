import { ensureSchema, getDb } from "./db";
import type { Platform, Status, TemaId } from "./constants";

export type PlatformExecution = {
  id: string;
  ideaId: string;
  platform: Platform;
  status: Status;
  format: string | null;
  scheduledAt: string | null;
};

export type Idea = {
  id: string;
  rawText: string;
  hook: string;
  tema: TemaId;
  notes: string | null;
  createdAt: string;
  executions: PlatformExecution[];
};

export type NewExecution = {
  platform: Platform;
  format?: string | null;
};

export type NewIdea = {
  rawText: string;
  hook: string;
  tema: TemaId;
  notes?: string | null;
  executions: NewExecution[];
};

function rowToExecution(row: Record<string, unknown>): PlatformExecution {
  return {
    id: row.id as string,
    ideaId: row.idea_id as string,
    platform: row.platform as Platform,
    status: row.status as Status,
    format: (row.format as string | null) ?? null,
    scheduledAt: (row.scheduled_at as string | null) ?? null,
  };
}

function rowToIdea(row: Record<string, unknown>): Omit<Idea, "executions"> {
  return {
    id: row.id as string,
    rawText: row.raw_text as string,
    hook: row.hook as string,
    tema: row.tema as TemaId,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function createIdea(input: NewIdea): Promise<string> {
  await ensureSchema();
  const db = getDb();
  const ideaId = crypto.randomUUID();

  await db.execute({
    sql: "INSERT INTO ideas (id, raw_text, hook, tema, notes) VALUES (?, ?, ?, ?, ?)",
    args: [ideaId, input.rawText, input.hook, input.tema, input.notes ?? null],
  });

  for (const exec of input.executions) {
    await db.execute({
      sql: "INSERT INTO platform_executions (id, idea_id, platform, format) VALUES (?, ?, ?, ?)",
      args: [crypto.randomUUID(), ideaId, exec.platform, exec.format ?? null],
    });
  }

  return ideaId;
}

export async function listIdeas(): Promise<Idea[]> {
  await ensureSchema();
  const db = getDb();

  const ideasResult = await db.execute(
    "SELECT * FROM ideas ORDER BY created_at DESC",
  );
  const execsResult = await db.execute("SELECT * FROM platform_executions");

  const execsByIdea = new Map<string, PlatformExecution[]>();
  for (const row of execsResult.rows as unknown as Record<string, unknown>[]) {
    const exec = rowToExecution(row);
    const list = execsByIdea.get(exec.ideaId) ?? [];
    list.push(exec);
    execsByIdea.set(exec.ideaId, list);
  }

  return (ideasResult.rows as unknown as Record<string, unknown>[]).map((row) => {
    const idea = rowToIdea(row);
    return { ...idea, executions: execsByIdea.get(idea.id) ?? [] };
  });
}

export async function getIdea(id: string): Promise<Idea | null> {
  await ensureSchema();
  const db = getDb();

  const ideaResult = await db.execute({
    sql: "SELECT * FROM ideas WHERE id = ?",
    args: [id],
  });
  const ideaRow = ideaResult.rows[0] as unknown as Record<string, unknown> | undefined;
  if (!ideaRow) return null;

  const execsResult = await db.execute({
    sql: "SELECT * FROM platform_executions WHERE idea_id = ?",
    args: [id],
  });

  return {
    ...rowToIdea(ideaRow),
    executions: (execsResult.rows as unknown as Record<string, unknown>[]).map(rowToExecution),
  };
}

export async function updateIdeaNotes(id: string, notes: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: "UPDATE ideas SET notes = ? WHERE id = ?",
    args: [notes, id],
  });
}

export async function updateExecution(
  executionId: string,
  updates: { status?: Status; format?: string | null; scheduledAt?: string | null },
): Promise<void> {
  await ensureSchema();
  const db = getDb();

  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (updates.status !== undefined) {
    fields.push("status = ?");
    args.push(updates.status);
  }
  if (updates.format !== undefined) {
    fields.push("format = ?");
    args.push(updates.format);
  }
  if (updates.scheduledAt !== undefined) {
    fields.push("scheduled_at = ?");
    args.push(updates.scheduledAt);
  }
  if (fields.length === 0) return;

  args.push(executionId);
  await db.execute({
    sql: `UPDATE platform_executions SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}
