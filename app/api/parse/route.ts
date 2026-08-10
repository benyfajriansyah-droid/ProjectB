import { NextRequest, NextResponse } from "next/server";
import { parseIdeaText } from "@/lib/ai/parse";
import { MISSING_GEMINI_KEY_MESSAGE } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  const { rawText } = (await request.json()) as { rawText?: string };

  if (!rawText || !rawText.trim()) {
    return NextResponse.json({ error: "Teks ide kosong" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: MISSING_GEMINI_KEY_MESSAGE }, { status: 503 });
  }

  try {
    const parsed = await parseIdeaText(rawText);
    return NextResponse.json(parsed);
  } catch (err) {
    // Surfaced rather than swallowed: this is a single-user app, and a generic
    // "gagal" gives nothing to act on when the AI call is the thing that broke.
    const detail = err instanceof Error ? err.message : String(err);
    console.error("parse failed", err);
    return NextResponse.json(
      { error: `Gagal memproses ide.\n\nPenyebab: ${detail}` },
      { status: 500 },
    );
  }
}
