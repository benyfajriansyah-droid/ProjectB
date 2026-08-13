"use client";

import { useState } from "react";
import { IconSpark } from "@/components/icons";

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
    <section className="overflow-hidden rounded-xl bg-ink text-white">
      <div className="flex items-center gap-2 px-5 pt-4">
        <IconSpark size={15} className="text-white/60" />
        <span className="text-[12px] font-medium uppercase tracking-[0.07em] text-white/60">
          Briefing hari ini
        </span>
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto rounded-md border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          {loading ? "Menyusun…" : body ? "Perbarui" : "Buat briefing"}
        </button>
      </div>

      <div className="px-5 pb-5 pt-3">
        {error && (
          <p className="whitespace-pre-line rounded-lg bg-white/5 p-3 text-[13px] leading-relaxed text-[#ff9d9d]">
            {error}
          </p>
        )}

        {!error && !body && (
          <p className="text-[14px] leading-relaxed text-white/50">
            AI baca keuangan, sosmed, dan konten lo — terus kasih penilaian jujur plus tiga langkah
            buat hari ini.
          </p>
        )}

        {!error && body && (
          <p className="whitespace-pre-line text-[14px] leading-[1.65] text-white/90">{body}</p>
        )}
      </div>
    </section>
  );
}
