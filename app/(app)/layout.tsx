import Link from "next/link";
import LogoutButton from "./logout-button";
import NavLink from "./nav-link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
              C
            </span>
            <span className="hidden text-sm font-semibold text-slate-800 sm:block">
              Content Hub
            </span>
          </Link>

          <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/keuangan">Keuangan</NavLink>
            <NavLink href="/konten">Konten</NavLink>
            <NavLink href="/sosmed">Sosmed</NavLink>
          </nav>

          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-16">{children}</main>
    </div>
  );
}
