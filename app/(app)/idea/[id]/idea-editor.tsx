"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PLATFORM_LABELS,
  STATUSES,
  STATUS_INK,
  STATUS_LABELS,
  type Status,
} from "@/lib/constants";
import type { Idea } from "@/lib/ideas";
import { Card } from "@/components/ui";

export default function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [notes, setNotes] = useState(idea.notes ?? "");
  const [savedNotes, setSavedNotes] = useState(idea.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingExec, setSavingExec] = useState<string | null>(null);

  async function updateExecution(
    execId: string,
    updates: { status?: Status; format?: string; scheduledAt?: string },
  ) {
    setSavingExec(execId);
    await fetch(`/api/executions/${execId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSavingExec(null);
    router.refresh();
  }

  async function saveNotes() {
    setSavingNotes(true);
    await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavedNotes(notes);
    setSavingNotes(false);
  }

  const field =
    "w-full rounded-lg border border-hairline px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-ink-muted";

  return (
    <div className="space-y-4">
      {idea.executions.map((exec) => (
        <Card key={exec.id} className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[13px] font-medium text-ink">
              {PLATFORM_LABELS[exec.platform]}
            </span>
            {savingExec === exec.id && (
              <span className="ml-auto text-[11px] text-ink-faint">menyimpan…</span>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {STATUSES.map((s) => {
              const active = exec.status === s;
              return (
                <button
                  key={s}
                  onClick={() => updateExecution(exec.id, { status: s })}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={
                    active
                      ? { backgroundColor: STATUS_INK[s].bg, color: STATUS_INK[s].fg }
                      : { color: "#8a8880", backgroundColor: "transparent" }
                  }
                >
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[11px] text-ink-muted">Format</span>
              <input
                defaultValue={exec.format ?? ""}
                onBlur={(e) => updateExecution(exec.id, { format: e.target.value })}
                placeholder="reels, carousel, story…"
                className={field}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] text-ink-muted">Rencana tayang</span>
              <input
                type="date"
                defaultValue={exec.scheduledAt ?? ""}
                onChange={(e) => updateExecution(exec.id, { scheduledAt: e.target.value })}
                className={field}
              />
            </label>
          </div>
        </Card>
      ))}

      <Card className="p-4">
        <label className="text-[11px] text-ink-muted">Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Detail tambahan, referensi, angle yang mau dipakai…"
          className={`${field} mt-1 resize-none placeholder:text-ink-faint`}
        />
        <div className="mt-2.5 flex items-center gap-3">
          <button
            onClick={saveNotes}
            disabled={savingNotes || notes === savedNotes}
            className="rounded-lg bg-ink px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            {savingNotes ? "Menyimpan…" : "Simpan catatan"}
          </button>
          {notes !== savedNotes && (
            <span className="text-[11px] text-ink-muted">belum disimpan</span>
          )}
        </div>
      </Card>
    </div>
  );
}
