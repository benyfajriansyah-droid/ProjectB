"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/constants";
import type { Idea } from "@/lib/ideas";

export default function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [notes, setNotes] = useState(idea.notes ?? "");
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
    setSavingNotes(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {idea.executions.map((exec) => (
          <div
            key={exec.id}
            className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase text-white/70">
                {exec.platform}
              </span>
              {savingExec === exec.id && (
                <span className="text-xs text-white/40">Menyimpan...</span>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <select
                defaultValue={exec.status}
                onChange={(e) => updateExecution(exec.id, { status: e.target.value as Status })}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <input
                defaultValue={exec.format ?? ""}
                onBlur={(e) => updateExecution(exec.id, { format: e.target.value })}
                placeholder="Format"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none"
              />

              <input
                type="date"
                defaultValue={exec.scheduledAt ?? ""}
                onChange={(e) => updateExecution(exec.id, { scheduledAt: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {savingNotes ? "Menyimpan..." : "Simpan catatan"}
        </button>
      </div>
    </div>
  );
}
