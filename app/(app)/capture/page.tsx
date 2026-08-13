"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMAS, PLATFORM_LABELS, platformsForTema, type Platform, type TemaId } from "@/lib/constants";

type ExecutionDraft = { platform: Platform; format: string; enabled: boolean };

const CONTOH = [
  "Kepikiran bikin konten cara pakai AI buat nulis caption otomatis",
  "Tadi nemu kedai kopi baru, cocok buat cerita santai",
  "Mau review tempat liburan yang murah tapi bagus",
];

export default function CapturePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hook, setHook] = useState("");
  const [temaId, setTemaId] = useState<TemaId | "">("");
  const [executions, setExecutions] = useState<ExecutionDraft[]>([]);
  const [hasPreview, setHasPreview] = useState(false);

  const activeTema = TEMAS.find((t) => t.id === temaId);

  function applyTema(newTema: TemaId, existing: ExecutionDraft[]) {
    return platformsForTema(newTema).map((platform) => {
      const prev = existing.find((e) => e.platform === platform);
      return prev ?? { platform, format: "video", enabled: true };
    });
  }

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Gagal memproses ide. Coba lagi.");
        return;
      }

      const parsed = (await res.json()) as {
        hook: string;
        tema: TemaId;
        executions: { platform: Platform; format: string }[];
      };

      setHook(parsed.hook);
      setTemaId(parsed.tema);
      setExecutions(
        platformsForTema(parsed.tema).map((platform) => {
          const match = parsed.executions.find((e) => e.platform === platform);
          return { platform, format: match?.format ?? "video", enabled: Boolean(match) };
        }),
      );
      setHasPreview(true);
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!temaId) return;
    const active = executions.filter((e) => e.enabled);
    if (active.length === 0) {
      setError("Pilih minimal 1 platform.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          hook,
          tema: temaId,
          executions: active.map(({ platform, format }) => ({ platform, format })),
        }),
      });
      if (!res.ok) throw new Error();

      router.push("/konten");
      router.refresh();
    } catch {
      setError("Gagal menyimpan ide. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Capture ide</h1>
        <p className="text-sm text-slate-500">
          Tulis bebas kayak lagi cerita. Nggak usah rapi — AI yang beresin.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Contohnya: kepikiran bikin konten soal cara pakai AI buat bikin caption, kayaknya cocok jadi reels..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />

        {!rawText && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CONTOH.map((c) => (
              <button
                key={c}
                onClick={() => setRawText(c)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                {c.slice(0, 34)}…
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={parsing || !rawText.trim()}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
        >
          {parsing ? "Memproses…" : "✨ Proses dengan AI"}
        </button>
      </div>

      {error && (
        <p className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {hasPreview && activeTema && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Hasil AI</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              bisa dikoreksi
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Judul / hook</label>
            <input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Tema</label>
            <div className="flex flex-wrap gap-2">
              {TEMAS.map((t) => {
                const selected = t.id === temaId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemaId(t.id);
                      setExecutions((prev) => applyTema(t.id, prev));
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? `${t.accent.chipBg} ${t.accent.chipText} ${t.accent.border}`
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${t.accent.dot}`} />
                    {t.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Platform & format</label>
            {executions.map((exec, i) => (
              <div
                key={exec.platform}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  exec.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={exec.enabled}
                  onChange={(e) =>
                    setExecutions((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, enabled: e.target.checked } : p)),
                    )
                  }
                  className="h-4 w-4 shrink-0 accent-violet-600"
                />
                <span className="w-20 shrink-0 text-sm font-medium text-slate-700">
                  {PLATFORM_LABELS[exec.platform]}
                </span>
                <input
                  value={exec.format}
                  onChange={(e) =>
                    setExecutions((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, format: e.target.value } : p)),
                    )
                  }
                  disabled={!exec.enabled}
                  placeholder="format"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-violet-400 disabled:bg-transparent disabled:text-slate-400"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan ide"}
          </button>
        </div>
      )}
    </div>
  );
}
