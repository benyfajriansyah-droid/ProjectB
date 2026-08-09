import { NextRequest, NextResponse } from "next/server";
import { parseIdeaText } from "@/lib/ai/parse";

export async function POST(request: NextRequest) {
  const { rawText } = (await request.json()) as { rawText?: string };

  if (!rawText || !rawText.trim()) {
    return NextResponse.json({ error: "Teks ide kosong" }, { status: 400 });
  }

  try {
    const parsed = await parseIdeaText(rawText);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("parse failed", err);
    return NextResponse.json({ error: "Gagal memproses ide" }, { status: 500 });
  }
}
