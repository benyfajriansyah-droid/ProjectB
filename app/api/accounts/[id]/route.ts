import { NextResponse } from "next/server";
import { deleteAccount, listAccounts, ideaCountByTheme } from "@/lib/accounts";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const accounts = await listAccounts();
  const target = accounts.find((a) => a.id === id);
  if (!target) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  }

  // Removing the persona's last platform would leave its ideas pointing at
  // nothing, so that case is refused rather than silently orphaning them.
  const siblings = accounts.filter((a) => a.themeKey === target.themeKey);
  if (siblings.length === 1) {
    const counts = await ideaCountByTheme();
    const ideas = counts.get(target.themeKey) ?? 0;
    if (ideas > 0) {
      return NextResponse.json(
        {
          error:
            `Akun ini masih dipakai ${ideas} ide. Pindahkan atau hapus ide-idenya dulu ` +
            "sebelum menghapus akun terakhir dari tema ini.",
        },
        { status: 409 },
      );
    }
  }

  await deleteAccount(id);
  return NextResponse.json({ ok: true });
}
