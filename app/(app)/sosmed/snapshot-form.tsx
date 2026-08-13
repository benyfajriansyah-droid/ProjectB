"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLATFORM_LABELS, tintFor, type Platform } from "@/lib/constants";
import type { Theme } from "@/lib/accounts";

function todayLocal(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function toNumber(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export default function SnapshotForm({ themes }: { themes: Theme[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [temaId, setTemaId] = useState<string>(themes[0]?.key ?? "");
  const [platform, setPlatform] = useState<Platform>("ig");
  const [followers, setFollowers] = useState("");
  const [views, setViews] = useState("");
  const [engagement, setEngagement] = useState("");
  const [recordedOn, setRecordedOn] = useState(todayLocal());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platformsFor = (key: string): Platform[] =>
    themes.find((t) => t.key === key)?.accounts.map((a) => a.platform) ?? [];
  const available = platformsFor(temaId);

  function switchTema(next: string) {
    setTemaId(next);
    const allowed = platformsFor(next);
    if (allowed.length && !allowed.includes(platform)) setPlatform(allowed[0]);
  }

  async function handleSave() {
    if (!followers && !views && !engagement) {
      setError("Isi minimal satu angka.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          tema: temaId,
          followers: toNumber(followers),
          views: toNumber(views),
          engagement: toNumber(engagement),
          recordedOn,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Gagal menyimpan.");
        return;
      }

      setFollowers("");
      setViews("");
      setEngagement("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-ink-faint py-4 text-sm font-medium text-ink-muted transition hover:border-ink-muted hover:bg-plane hover:text-ink"
      >
        + Catat angka akun
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">Akun</label>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTema(t.key)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={
                t.key === temaId
                  ? { backgroundColor: tintFor(t.color), color: t.color, borderColor: t.color }
                  : { borderColor: "rgba(11,11,11,0.09)", color: "#5c5b55" }
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              {t.short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {available.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              platform === p ? "bg-ink text-white" : "bg-plane text-ink-muted hover:bg-plane"
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Follower", value: followers, set: setFollowers },
          { label: "Views", value: views, set: setViews },
          { label: "Engagement", value: engagement, set: setEngagement },
        ].map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">{field.label}</label>
            <input
              inputMode="numeric"
              value={field.value}
              onChange={(e) => field.set(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="—"
              className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none transition focus:border-ink-muted "
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">Tanggal</label>
        <input
          type="date"
          value={recordedOn}
          onChange={(e) => setRecordedOn(e.target.value)}
          className="w-full rounded-xl border border-hairline px-3 py-2.5 text-sm outline-none focus:border-ink-muted"
        />
      </div>

      {error && <p className="text-sm text-critical">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl border border-hairline px-5 text-sm text-ink-secondary transition hover:bg-plane"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
