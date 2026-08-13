"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChart,
  IconExit,
  IconGrid,
  IconPlus,
  IconSpark,
  IconWallet,
} from "@/components/icons";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: IconGrid },
  { href: "/keuangan", label: "Keuangan", Icon: IconWallet },
  { href: "/konten", label: "Konten", Icon: IconSpark },
  { href: "/sosmed", label: "Sosmed", Icon: IconChart },
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
    // Fixed rail: icons only where width is scarce, labels once there's room.
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[60px] flex-col border-r border-hairline bg-surface lg:w-[212px]">
      <div className="flex h-14 items-center gap-2.5 px-4 lg:px-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white">
          C
        </span>
        <span className="hidden text-[13px] font-semibold tracking-tightish text-ink lg:block">
          Content Hub
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 lg:px-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors lg:px-3 ${
                active
                  ? "bg-ink text-white"
                  : "text-ink-secondary hover:bg-plane hover:text-ink"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}

        <Link
          href="/capture"
          title="Ide baru"
          className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-ink-faint px-2.5 py-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:bg-plane hover:text-ink lg:px-3"
        >
          <IconPlus size={17} className="shrink-0" />
          <span className="hidden lg:block">Ide baru</span>
        </Link>
      </nav>

      <button
        onClick={logout}
        title="Keluar"
        className="m-2 flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] text-ink-muted transition-colors hover:bg-plane hover:text-ink lg:m-3 lg:px-3"
      >
        <IconExit size={17} className="shrink-0" />
        <span className="hidden lg:block">Keluar</span>
      </button>
    </aside>
  );
}
