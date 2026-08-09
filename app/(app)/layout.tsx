import Link from "next/link";
import LogoutButton from "./logout-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/capture" className="hover:underline">
            Capture
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
