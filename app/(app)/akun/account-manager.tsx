"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Theme } from "@/lib/accounts";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/constants";
import { Card, TemaDot } from "@/components/ui";
import { IconPlus, IconTrash } from "@/components/icons";

export default function AccountManager({
  themes,
  ideaCounts,
}: {
  themes: Theme[];
  ideaCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [themeKey, setThemeKey] = useState<string>("");
  const [label, setLabel] = useState("");
  const [platform, setPlatform] = useState<Platform>("ig");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existing = themes.find((t) => t.key === themeKey);
  const takenPlatforms = existing?.accounts.map((a) => a.platform) ?? [];

  function chooseTheme(key: string) {
    setThemeKey(key);
    const theme = themes.find((t) => t.key === key);
    setLabel(theme?.label ?? "");
    const free = PLATFORMS.filter((p) => !(theme?.accounts ?? []).some((a) => a.platform === p));
    if (free.length) setPlatform(free[0]);
  }

  async function save() {
    if (!label.trim()) {
      setError("Nama akun wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeKey: themeKey || undefined, themeLabel: label, platform, handle }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Gagal menyimpan.");
        return;
      }
      setLabel("");
      setHandle("");
      setThemeKey("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Gagal menghapus.");
      return;
    }
    router.refresh();
  }

  const field =
    "w-full rounded-lg border border-hairline px-3 py-2 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-muted";

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-lg bg-[#fdf0f0] p-3 text-[12px] leading-relaxed text-[#8f2727]">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {themes.map((theme) => (
          <Card key={theme.key} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
              <TemaDot color={theme.color} size={8} />
              <span className="text-[13px] font-medium text-ink">{theme.label}</span>
              <span className="ml-auto text-[11px] tabular-nums text-ink-faint">
                {ideaCounts[theme.key] ?? 0} ide
              </span>
            </div>

            <ul className="divide-y divide-rule">
              {theme.accounts.map((account) => (
                <li key={account.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-[72px] shrink-0 text-[12px] font-medium text-ink-secondary">
                    {PLATFORM_LABELS[account.platform]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink-muted">
                    {account.handle ?? "—"}
                  </span>
                  <button
                    onClick={() => remove(account.id)}
                    aria-label={`Hapus ${PLATFORM_LABELS[account.platform]} ${theme.label}`}
                    className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-[#fdf0f0] hover:text-critical"
                  >
                    <IconTrash size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-faint py-4 text-[13px] font-medium text-ink-muted transition-colors hover:border-ink-muted hover:bg-plane hover:text-ink"
        >
          <IconPlus size={16} />
          Tambah akun
        </button>
      ) : (
        <Card className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-[11px] text-ink-muted">Tema / brand</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setThemeKey("");
                  setLabel("");
                }}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  themeKey === "" ? "border-ink bg-ink text-white" : "border-hairline text-ink-secondary"
                }`}
              >
                + Tema baru
              </button>
              {themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => chooseTheme(t.key)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors"
                  style={
                    themeKey === t.key
                      ? { borderColor: t.color, color: t.color }
                      : { borderColor: "rgba(11,11,11,0.09)", color: "#5c5b55" }
                  }
                >
                  <TemaDot color={t.color} size={7} />
                  {t.short}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-ink-muted">Nama tema</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="mis. Cerita Kopi Beny"
              className={field}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-ink-muted">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => {
                const taken = takenPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    disabled={taken}
                    className={`rounded-lg py-2.5 text-[13px] font-medium transition-colors ${
                      platform === p && !taken
                        ? "bg-ink text-white"
                        : "bg-plane text-ink-muted hover:text-ink disabled:opacity-40"
                    }`}
                  >
                    {PLATFORM_LABELS[p]}
                    {taken && " · sudah ada"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-ink-muted">
              Username <span className="text-ink-faint">(opsional)</span>
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className={field}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-lg bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "Menyimpan…" : "Simpan akun"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-hairline px-5 text-[13px] text-ink-secondary transition-colors hover:bg-plane"
            >
              Batal
            </button>
          </div>
        </Card>
      )}

      <p className="text-[12px] leading-relaxed text-ink-muted">
        Menghapus akun tidak menghapus ide yang sudah tersimpan. Akun terakhir dari sebuah tema
        hanya bisa dihapus kalau tema itu tidak lagi dipakai ide manapun.
      </p>
    </div>
  );
}
