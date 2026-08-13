import Link from "next/link";
import { STATUS_INK, STATUS_LABELS, PLATFORM_SHORT, type Platform, type Status } from "@/lib/constants";
import { IconChevron } from "./icons";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold tracking-tightish text-ink">{title}</h1>
      {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  title,
  meta,
  href,
  hrefLabel = "Lihat semua",
}: {
  title: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">
          {title}
        </h2>
        {meta && <span className="text-[12px] text-ink-faint">{meta}</span>}
      </div>
      {href && (
        <Link
          href={href}
          className="group flex items-center gap-0.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          {hrefLabel}
          <IconChevron size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function StatusChip({ platform, status }: { platform: Platform; status: Status }) {
  const ink = STATUS_INK[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: ink.bg, color: ink.fg }}
    >
      <span className="font-semibold tracking-wide">{PLATFORM_SHORT[platform]}</span>
      <span className="opacity-30">·</span>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TemaDot({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-3.5 text-[13px] text-ink-faint">{children}</p>;
}
