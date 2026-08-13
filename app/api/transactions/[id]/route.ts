import { NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/finance";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteTransaction(id);
  return NextResponse.json({ ok: true });
}
