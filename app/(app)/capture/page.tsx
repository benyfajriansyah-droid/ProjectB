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
        <h1 className="text-xl font-bold text-ink">Capture ide</h1>
        <p className="text-sm text-ink-muted">
          Tulis bebas kayak lagi cerita. Nggak usah rapi — AI yang beresin.
        </p>
      </div>

      <div className="rounded-xl border border-hairline bg-surface p-4">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Contohnya: kepikiran bikin konten soal cara pakai AI buat bikin caption, kayaknya cocok jadi reels..."
          className="w-full resize-none rounded-xl border border-hairline bg-plane px-4 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-ink-faint focus:border-ink-muted focus:bg-surface "
        />

        {!rawText && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CONTOH.map((c) => (
              <button
                key={c}
                onClick={() => setRawText(c)}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-ink-muted transition hover:border-slate-300 hover:bg-plane hover:text-ink"
              >
                {c.slice(0, 34)}…
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={parsing || !rawText.trim()}
          className="mt-4 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
        >
          {parsing ? "Memproses…" : "✨ Proses dengan AI"}
        </button>
      </div>

      {error && (
        <p className="whitespace-pre-line rounded-xl border border-critical/30 bg-[#fdf0f0] p-4 text-sm text-critical">
          {error}
        </p>
      )}

      {hasPreview && activeTema && (
        <div className="space-y-5 rounded-xl border border-hairline bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">Hasil AI</span>
            <span className="rounded-full bg-[#e4f5e4] px-2 py-0.5 text-[11px] font-medium text-[#0a7d0a] ring-1 ring-inset ring-[#bfe6bf]">
              bisa dikoreksi
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Judul / hook</label>
            <input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm text-ink outline-none transition focus:border-ink-muted "
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Tema</label>
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
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
                    style={
                      selected
                        ? { backgroundColor: t.tint, color: t.color, borderColor: t.color }
                        : { borderColor: "rgba(11,11,11,0.09)", color: "#5c5b55" }
                    }
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-muted">Platform & format</label>
            {executions.map((exec, i) => (
              <div
                key={exec.platform}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  exec.enabled ? "border-hairline bg-surface" : "border-rule bg-plane"
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
                  className="h-4 w-4 shrink-0 accent-[#2a78d6]"
                />
                <span className="w-20 shrink-0 text-sm font-medium text-ink">
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
                  className="min-w-0 flex-1 rounded-lg border border-hairline px-3 py-1.5 text-sm outline-none transition focus:border-ink-muted disabled:bg-transparent disabled:text-ink-faint"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan ide"}
          </button>
        </div>
      )}
    </div>
  );
}
