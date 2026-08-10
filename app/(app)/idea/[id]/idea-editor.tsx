"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
  type Status,
} from "@/lib/constants";
import type { Idea } from "@/lib/ideas";

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

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {idea.executions.map((exec) => (
          <div key={exec.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {PLATFORM_LABELS[exec.platform]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLES[exec.status]}`}
              >
                {STATUS_LABELS[exec.status]}
              </span>
              {savingExec === exec.id && (
                <span className="ml-auto text-xs text-slate-400">menyimpan…</span>
              )}
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateExecution(exec.id, { status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ring-1 ring-inset ${
                    exec.status === s
                      ? STATUS_STYLES[s]
                      : "bg-white text-slate-400 ring-slate-200 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Format</span>
                <input
                  defaultValue={exec.format ?? ""}
                  onBlur={(e) => updateExecution(exec.id, { format: e.target.value })}
                  placeholder="reels, carousel, story…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Rencana tayang</span>
                <input
                  type="date"
                  defaultValue={exec.scheduledAt ?? ""}
                  onChange={(e) => updateExecution(exec.id, { scheduledAt: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-xs font-medium text-slate-500">Catatan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Detail tambahan, referensi, angle yang mau dipakai…"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={saveNotes}
            disabled={savingNotes || notes === savedNotes}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            {savingNotes ? "Menyimpan…" : "Simpan catatan"}
          </button>
          {notes !== savedNotes && (
            <span className="text-xs text-amber-600">belum disimpan</span>
          )}
        </div>
      </div>
    </div>
  );
}
