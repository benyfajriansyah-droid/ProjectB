"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
            C
          </div>
          <h1 className="text-xl font-bold text-slate-900">Content Hub</h1>
          <p className="mt-1 text-sm text-slate-500">Ide konten & status, satu tempat.</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            placeholder="Password"
          />

          {error && (
            <p className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Masuk…" : "Masuk"}
          </button>
        </div>
      </form>
    </main>
  );
}
