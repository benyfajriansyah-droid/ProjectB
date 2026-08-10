import { STATUS_LABELS, STATUS_STYLES, type Platform, type Status } from "@/lib/constants";

export default function StatusChip({
  platform,
  status,
}: {
  platform: Platform;
  status: Status;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className="font-semibold uppercase tracking-wide">
        {platform === "ig" ? "IG" : "TT"}
      </span>
      <span className="opacity-40">·</span>
      {STATUS_LABELS[status]}
    </span>
  );
}
