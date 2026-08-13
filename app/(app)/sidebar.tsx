"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChart,
  IconExit,
  IconGrid,
  IconPlus,
  IconSpark,
  IconUsers,
  IconWallet,
} from "@/components/icons";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", short: "Home", Icon: IconGrid },
  { href: "/keuangan", label: "Keuangan", short: "Uang", Icon: IconWallet },
  { href: "/konten", label: "Konten", short: "Konten", Icon: IconSpark },
  { href: "/sosmed", label: "Sosmed", short: "Sosmed", Icon: IconChart },
  { href: "/akun", label: "Akun", short: "Akun", Icon: IconUsers },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    // Narrow rail stacks a label under each icon; the wide sidebar sets them
    // side by side. Either way the tab always names itself.
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[74px] flex-col border-r border-hairline bg-surface lg:w-[212px]">
      <div className="flex h-14 items-center justify-center gap-2.5 lg:justify-start lg:px-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white">
          C
        </span>
        <span className="hidden text-[13px] font-semibold tracking-tightish text-ink lg:block">
          Content Hub
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 lg:gap-0.5 lg:px-3">
        {ITEMS.map(({ href, label, short, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[13px] font-medium transition-colors lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 ${
                active
                  ? "bg-ink text-white"
                  : "text-ink-secondary hover:bg-plane hover:text-ink"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-[10px] leading-none lg:hidden">{short}</span>
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}

        <Link
          href="/capture"
          className="mt-1.5 flex flex-col items-center gap-1 rounded-lg border border-dashed border-ink-faint px-1 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:bg-plane hover:text-ink lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5"
        >
          <IconPlus size={18} className="shrink-0" />
          <span className="text-[10px] leading-none lg:hidden">Ide</span>
          <span className="hidden lg:block">Ide baru</span>
        </Link>
      </nav>

      <button
        onClick={logout}
        className="m-2 flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[13px] text-ink-muted transition-colors hover:bg-plane hover:text-ink lg:m-3 lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5"
      >
        <IconExit size={18} className="shrink-0" />
        <span className="text-[10px] leading-none lg:hidden">Keluar</span>
        <span className="hidden lg:block">Keluar</span>
      </button>
    </aside>
  );
}
