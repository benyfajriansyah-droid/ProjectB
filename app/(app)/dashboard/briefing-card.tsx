"use client";

import { useState } from "react";

export default function BriefingCard({ initial }: { initial: string | null }) {
  const [body, setBody] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/briefing", { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { body?: string; error?: string }
        | null;

      if (!res.ok || !data?.body) {
        setError(data?.error ?? "Gagal membuat briefing.");
        return;
      }
      setBody(data.body);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
      <div className="flex items-center gap-2 border-b border-violet-100 px-5 py-3">
        <span className="text-base">☀️</span>
        <span className="text-sm font-semibold text-violet-900">Briefing hari ini</span>
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto rounded-lg bg-white/70 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-white disabled:opacity-50"
        >
          {loading ? "Menyusun…" : body ? "Perbarui" : "Buat briefing"}
        </button>
      </div>

      <div className="px-5 py-4">
        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && !body && (
          <p className="text-sm text-violet-800/70">
            Klik &ldquo;Buat briefing&rdquo; — AI bakal baca keuangan, sosmed, dan konten lo, terus
            kasih 3 langkah konkret buat hari ini.
          </p>
        )}

        {!error && body && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{body}</p>
        )}
      </div>
    </section>
  );
}
