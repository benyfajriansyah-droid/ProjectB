import Link from "next/link";
import { listThemes } from "@/lib/accounts";
import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { Card, PageTitle } from "@/components/ui";
import CaptureForm from "./capture-form";

export const dynamic = "force-dynamic";

export default async function CapturePage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Capture ide" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const themes = await listThemes();

  if (themes.length === 0) {
    return (
      <>
        <PageTitle title="Capture ide" />
        <Card className="px-6 py-10 text-center">
          <h2 className="text-[15px] font-semibold text-ink">Belum ada akun</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-muted">
            Tambahkan minimal satu akun dulu — ide selalu diikat ke salah satu akun.
          </p>
          <Link
            href="/akun"
            className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Atur akun
          </Link>
        </Card>
      </>
    );
  }

  return <CaptureForm themes={themes} />;
}
