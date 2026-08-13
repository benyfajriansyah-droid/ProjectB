import { NextRequest, NextResponse } from "next/server";
import { updateIdeaNotes } from "@/lib/ideas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { notes } = (await request.json()) as { notes?: string };

  await updateIdeaNotes(id, notes ?? "");
  return NextResponse.json({ ok: true });
}
