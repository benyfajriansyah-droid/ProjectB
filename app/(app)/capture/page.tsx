"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMAS, platformsForTema, type Platform, type TemaId } from "@/lib/constants";

type ExecutionDraft = { platform: Platform; format: string; enabled: boolean };

export default function CapturePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hook, setHook] = useState("");
  const [tema, setTema] = useState<TemaId | "">("");
  const [executions, setExecutions] = useState<ExecutionDraft[]>([]);
  const [hasPreview, setHasPreview] = useState(false);

  function applyTema(newTema: TemaId, existing: ExecutionDraft[]) {
    const allowed = platformsForTema(newTema);
    return allowed.map((platform) => {
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
      setTema(parsed.tema);
      const allowed = platformsForTema(parsed.tema);
      setExecutions(
        allowed.map((platform) => {
          const match = parsed.executions.find((e) => e.platform === platform);
          return { platform, format: match?.format ?? "video", enabled: Boolean(match) };
        }),
      );
      setHasPreview(true);
    } catch {
      setError("Gagal memproses ide. Coba lagi.");
    } finally {
      setParsing(false);
    }
  }

  function handleTemaChange(newTema: TemaId) {
    setTema(newTema);
    setExecutions((prev) => applyTema(newTema, prev));
  }

  async function handleSave() {
    if (!tema) return;
    const activeExecutions = executions.filter((e) => e.enabled);
    if (activeExecutions.length === 0) {
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
          tema,
          executions: activeExecutions.map(({ platform, format }) => ({ platform, format })),
        }),
      });
      if (!res.ok) throw new Error();

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Gagal menyimpan ide. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Capture ide</h1>

      <div className="space-y-2">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={5}
          placeholder="Tulis bebas idenya, kayak curhat aja..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
        />
        <button
          onClick={handleParse}
          disabled={parsing || !rawText.trim()}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {parsing ? "Memproses..." : "Proses dengan AI"}
        </button>
      </div>

      {error && <p className="whitespace-pre-line text-sm text-red-400">{error}</p>}

      {hasPreview && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60">Judul/hook</label>
            <input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/60">Tema</label>
            <select
              value={tema}
              onChange={(e) => handleTemaChange(e.target.value as TemaId)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
            >
              {TEMAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Platform & format</label>
            {executions.map((exec, i) => (
              <div key={exec.platform} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exec.enabled}
                  onChange={(e) =>
                    setExecutions((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, enabled: e.target.checked } : p)),
                    )
                  }
                />
                <span className="w-16 text-sm uppercase text-white/70">{exec.platform}</span>
                <input
                  value={exec.format}
                  onChange={(e) =>
                    setExecutions((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, format: e.target.value } : p)),
                    )
                  }
                  disabled={!exec.enabled}
                  className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-white/30 disabled:opacity-40"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-white py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan ide"}
          </button>
        </div>
      )}
    </div>
  );
}
