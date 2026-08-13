import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { accountStates, delta, listSnapshots } from "@/lib/social";
import { PLATFORM_LABELS, TEMAS, type Platform } from "@/lib/constants";
import SnapshotForm from "./snapshot-form";

export const dynamic = "force-dynamic";

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-slate-300">—</span>;
  if (value === 0) return <span className="text-xs text-slate-400">tetap</span>;
  const up = value > 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toLocaleString("id-ID")}
    </span>
  );
}

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: number | null;
  change: number | null;
}) {
  return (
    <div>
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800">
        {value === null ? "—" : value.toLocaleString("id-ID")}
      </div>
      <Delta value={change} />
    </div>
  );
}

export default async function SosmedPage() {
  if (!isDbConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Sosmed</h1>
        <p className="whitespace-pre-line rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {MISSING_DATABASE_MESSAGE}
        </p>
      </div>
    );
  }

  const snapshots = await listSnapshots(300);
  const states = accountStates(snapshots);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Sosmed</h1>
        <p className="text-sm text-slate-500">
          Angka tiap akun dan arah pergerakannya sejak catatan sebelumnya.
        </p>
      </div>

      <SnapshotForm />

      <div className="space-y-3">
        {TEMAS.map((t) => {
          const platforms = Object.keys(t.handles) as Platform[];

          return (
            <div key={t.id} className={`overflow-hidden rounded-2xl border bg-white ${t.accent.border}`}>
              <div className={`flex items-center gap-2 px-4 py-2.5 ${t.accent.softBg}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${t.accent.dot}`} />
                <span className={`text-sm font-semibold ${t.accent.chipText}`}>{t.label}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {platforms.map((platform) => {
                  const state = states.get(`${t.id}:${platform}`);
                  const latest = state?.latest;
                  const previous = state?.previous;

                  return (
                    <div key={platform} className="px-4 py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                          {PLATFORM_LABELS[platform]}
                          <span className="ml-1.5 text-slate-400">{t.handles[platform]}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {latest ? `dicatat ${latest.recordedOn}` : "belum ada data"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Metric
                          label="Follower"
                          value={latest?.followers ?? null}
                          change={delta(latest?.followers ?? null, previous?.followers ?? null)}
                        />
                        <Metric
                          label="Views"
                          value={latest?.views ?? null}
                          change={delta(latest?.views ?? null, previous?.views ?? null)}
                        />
                        <Metric
                          label="Engagement"
                          value={latest?.engagement ?? null}
                          change={delta(latest?.engagement ?? null, previous?.engagement ?? null)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <strong className="text-slate-700">Kenapa masih manual?</strong> Instagram bisa
        disambungkan otomatis lewat Meta Developer (butuh akun Business/Creator yang ke-link ke
        Facebook Page). TikTok butuh persetujuan aplikasi dari pihak TikTok, yang waktunya di luar
        kendali kita. Data yang diisi manual dan yang nanti masuk otomatis disimpan di tempat yang
        sama, jadi tampilan ini tidak berubah saat penyambungan itu jadi.
      </p>
    </div>
  );
}
