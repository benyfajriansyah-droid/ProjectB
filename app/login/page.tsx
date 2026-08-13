"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      // A 503 means the server is misconfigured, not that the password is wrong.
      setError(res.status === 503 && body?.error ? body.error : "Password salah, coba lagi.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-[320px]">
        <div className="mb-7">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-[15px] font-semibold text-white">
            C
          </span>
          <h1 className="mt-4 text-[19px] font-semibold tracking-tightish text-ink">
            Content Hub
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Ide, keuangan, dan sosmed — satu tempat.
          </p>
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-surface py-2.5 pl-3.5 pr-11 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-muted"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink-faint transition-colors hover:text-ink-secondary"
          >
            {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>

        {error && (
          <p className="mt-2.5 whitespace-pre-line rounded-lg bg-[#fdf0f0] p-3 text-[12px] leading-relaxed text-[#8f2727]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full rounded-lg bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Masuk…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
