import { NextResponse } from "next/server";
import { buildBriefing } from "@/lib/briefing";

export async function POST() {
  try {
    const briefing = await buildBriefing(true);
    return NextResponse.json(briefing);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("briefing failed", err);
    return NextResponse.json(
      { error: `Gagal membuat briefing.\n\nPenyebab: ${detail}` },
      { status: 500 },
    );
  }
}
