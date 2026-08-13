import { NextRequest, NextResponse } from "next/server";
import { saveSnapshot } from "@/lib/social";
import { listThemes } from "@/lib/accounts";
import type { Platform } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    platform?: Platform;
    tema?: string;
    followers?: number | null;
    views?: number | null;
    engagement?: number | null;
    recordedOn?: string;
  };

  if (body.platform !== "ig" && body.platform !== "tiktok") {
    return NextResponse.json({ error: "Platform tidak valid" }, { status: 400 });
  }
  const themes = await listThemes();
  if (!body.tema || !themes.some((t) => t.key === body.tema)) {
    return NextResponse.json({ error: "Tema tidak valid" }, { status: 400 });
  }
  if (!body.recordedOn) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
  }

  await saveSnapshot({
    platform: body.platform,
    tema: body.tema,
    followers: body.followers ?? null,
    views: body.views ?? null,
    engagement: body.engagement ?? null,
    recordedOn: body.recordedOn,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
