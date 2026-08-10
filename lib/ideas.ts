import { query, type Row } from "./db";
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

function rowToExecution(row: Row): PlatformExecution {
  return {
    id: row.id as string,
    ideaId: row.idea_id as string,
    platform: row.platform as Platform,
    status: row.status as Status,
    format: (row.format as string | null) ?? null,
    scheduledAt: (row.scheduled_at as string | null) ?? null,
  };
}

function rowToIdea(row: Row): Omit<Idea, "executions"> {
  const createdAt = row.created_at;
  return {
    id: row.id as string,
    rawText: row.raw_text as string,
    hook: row.hook as string,
    tema: row.tema as TemaId,
    notes: (row.notes as string | null) ?? null,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
  };
}

export async function createIdea(input: NewIdea): Promise<string> {
  const ideaId = crypto.randomUUID();

  await query(
    "INSERT INTO ideas (id, raw_text, hook, tema, notes) VALUES ($1, $2, $3, $4, $5)",
    [ideaId, input.rawText, input.hook, input.tema, input.notes ?? null],
  );

  for (const exec of input.executions) {
    await query(
      "INSERT INTO platform_executions (id, idea_id, platform, format) VALUES ($1, $2, $3, $4)",
      [crypto.randomUUID(), ideaId, exec.platform, exec.format ?? null],
    );
  }

  return ideaId;
}

export async function listIdeas(): Promise<Idea[]> {
  const ideaRows = await query("SELECT * FROM ideas ORDER BY created_at DESC");
  // Ordered so the status chips keep a stable position between renders;
  // Postgres gives no ordering guarantee otherwise.
  const execRows = await query(
    "SELECT * FROM platform_executions ORDER BY idea_id, platform",
  );

  const execsByIdea = new Map<string, PlatformExecution[]>();
  for (const row of execRows) {
    const exec = rowToExecution(row);
    const list = execsByIdea.get(exec.ideaId) ?? [];
    list.push(exec);
    execsByIdea.set(exec.ideaId, list);
  }

  return ideaRows.map((row) => {
    const idea = rowToIdea(row);
    return { ...idea, executions: execsByIdea.get(idea.id) ?? [] };
  });
}

export async function getIdea(id: string): Promise<Idea | null> {
  const ideaRows = await query("SELECT * FROM ideas WHERE id = $1", [id]);
  const ideaRow = ideaRows[0];
  if (!ideaRow) return null;

  const execRows = await query(
    "SELECT * FROM platform_executions WHERE idea_id = $1 ORDER BY platform",
    [id],
  );

  return { ...rowToIdea(ideaRow), executions: execRows.map(rowToExecution) };
}

export async function updateIdeaNotes(id: string, notes: string): Promise<void> {
  await query("UPDATE ideas SET notes = $1 WHERE id = $2", [notes, id]);
}

export async function updateExecution(
  executionId: string,
  updates: { status?: Status; format?: string | null; scheduledAt?: string | null },
): Promise<void> {
  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (updates.status !== undefined) {
    args.push(updates.status);
    fields.push(`status = $${args.length}`);
  }
  if (updates.format !== undefined) {
    args.push(updates.format);
    fields.push(`format = $${args.length}`);
  }
  if (updates.scheduledAt !== undefined) {
    args.push(updates.scheduledAt);
    fields.push(`scheduled_at = $${args.length}`);
  }
  if (fields.length === 0) return;

  args.push(executionId);
  await query(
    `UPDATE platform_executions SET ${fields.join(", ")} WHERE id = $${args.length}`,
    args,
  );
}
