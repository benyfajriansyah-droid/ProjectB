import { CHART_INK } from "@/lib/constants";

/**
 * Horizontal bars: one series, so no legend — the section title names it.
 * Data-ends are rounded 4px and anchored square to the baseline; every bar
 * carries a direct label, which also satisfies the relief rule for marks that
 * sit below 3:1 against the surface.
 */
export function BarRows({
  rows,
  reference,
  referenceLabel,
}: {
  rows: { label: string; value: number; display: string }[];
  reference?: number;
  referenceLabel?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), reference ?? 0, 1);

  return (
    <div className="space-y-2">
      {reference !== undefined && (
        <div className="flex items-center gap-3 pb-0.5">
          <span className="w-[46px] shrink-0" />
          <span className="relative flex-1">
            <span
              className="absolute -top-0.5 flex -translate-x-1/2 items-center whitespace-nowrap text-[10px]"
              style={{ left: `${(reference / max) * 100}%`, color: CHART_INK.reference }}
            >
              {referenceLabel}
            </span>
          </span>
          <span className="w-[76px] shrink-0" />
        </div>
      )}

      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3" title={`${row.label}: ${row.display}`}>
          <span className="w-[46px] shrink-0 text-[11px] tabular-nums text-ink-muted">
            {row.label}
          </span>

          <span className="relative h-[18px] flex-1 overflow-hidden rounded-[3px]" style={{ backgroundColor: "#f2f1ec" }}>
            <span
              className="absolute inset-y-0 left-0 rounded-r-[4px]"
              style={{
                width: `${Math.max((row.value / max) * 100, row.value > 0 ? 1.5 : 0)}%`,
                backgroundColor: CHART_INK.series,
              }}
            />
            {reference !== undefined && (
              <span
                className="absolute inset-y-0 w-px"
                style={{ left: `${(reference / max) * 100}%`, backgroundColor: CHART_INK.reference }}
              />
            )}
          </span>

          <span className="w-[76px] shrink-0 text-right text-[11px] font-medium tabular-nums text-ink-secondary">
            {row.display}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Sparkline for a single account's history. 2px line with an end marker;
 * returns null below two points, where a line would imply a trend that isn't
 * in the data.
 */
export function Sparkline({
  values,
  width = 92,
  height = 26,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const rising = values[values.length - 1] >= values[0];
  const stroke = rising ? CHART_INK.good : CHART_INK.critical;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.75" fill={stroke} stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

/** Target progress as a single meter — a headline number, not a chart. */
export function Meter({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(percent, 100));
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#eeede8" }}>
      <span
        className="block h-full rounded-full transition-all"
        style={{
          width: `${clamped}%`,
          backgroundColor: clamped >= 100 ? CHART_INK.good : CHART_INK.series,
        }}
      />
    </span>
  );
}
