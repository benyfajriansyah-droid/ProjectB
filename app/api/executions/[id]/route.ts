import { NextRequest, NextResponse } from "next/server";
import { updateExecution } from "@/lib/ideas";
import { STATUSES, type Status } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    status?: Status;
    format?: string | null;
    scheduledAt?: string | null;
  };

  if (body.status && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  await updateExecution(id, body);
  return NextResponse.json({ ok: true });
}
