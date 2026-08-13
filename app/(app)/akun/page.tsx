import { MISSING_DATABASE_MESSAGE, isDbConfigured } from "@/lib/db";
import { ideaCountByTheme, listThemes } from "@/lib/accounts";
import { Card, PageTitle } from "@/components/ui";
import AccountManager from "./account-manager";

export const dynamic = "force-dynamic";

export default async function AkunPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageTitle title="Akun" />
        <Card className="border-warn/40 bg-[#fdf8ec] p-4">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#7a5c12]">
            {MISSING_DATABASE_MESSAGE}
          </p>
        </Card>
      </>
    );
  }

  const [themes, ideaCounts] = await Promise.all([listThemes(), ideaCountByTheme()]);

  return (
    <>
      <PageTitle
        title="Akun"
        subtitle="Tambah atau hapus akun sosial media. Semua panel lain ikut menyesuaikan."
      />
      <AccountManager
        themes={themes}
        ideaCounts={Object.fromEntries(ideaCounts)}
      />
    </>
  );
}
