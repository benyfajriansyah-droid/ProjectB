import { NextRequest, NextResponse } from "next/server";
import { createIdea } from "@/lib/ideas";
import { TEMAS, type Platform, type TemaId } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    rawText?: string;
    hook?: string;
    tema?: TemaId;
    executions?: { platform: Platform; format: string }[];
  };

  if (!body.rawText || !body.hook || !body.tema || !body.executions?.length) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  if (!TEMAS.some((t) => t.id === body.tema)) {
    return NextResponse.json({ error: "Tema tidak valid" }, { status: 400 });
  }

  const id = await createIdea({
    rawText: body.rawText,
    hook: body.hook,
    tema: body.tema,
    executions: body.executions,
  });

  return NextResponse.json({ id }, { status: 201 });
}
