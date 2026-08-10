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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <h1 className="text-lg font-semibold">Content Hub</h1>
        <p className="text-sm text-white/60">Masukkan password untuk masuk.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
          placeholder="Password"
        />
        {error && <p className="whitespace-pre-line text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white text-black font-medium py-2 disabled:opacity-50"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
