import { NextRequest, NextResponse } from "next/server";
import { createAccount, listThemes, nextColor, slugify, updateHandle } from "@/lib/accounts";
import { PLATFORMS, type Platform } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    themeLabel?: string;
    themeKey?: string;
    platform?: Platform;
    handle?: string;
  };

  const label = body.themeLabel?.trim();
  if (!label) {
    return NextResponse.json({ error: "Nama akun wajib diisi" }, { status: 400 });
  }
  if (!body.platform || !PLATFORMS.includes(body.platform)) {
    return NextResponse.json({ error: "Platform tidak valid" }, { status: 400 });
  }

  const themes = await listThemes();

  // Adding a platform to an existing persona keeps its key, so ideas already
  // filed under it stay attached.
  const existing = body.themeKey
    ? themes.find((t) => t.key === body.themeKey)
    : themes.find((t) => t.label.toLowerCase() === label.toLowerCase());

  let key = existing?.key;
  if (!key) {
    const base = slugify(label);
    key = base;
    let n = 2;
    while (themes.some((t) => t.key === key)) key = `${base}_${n++}`;
  }

  await createAccount({
    themeKey: key,
    themeLabel: label,
    platform: body.platform,
    handle: body.handle?.trim() || null,
    color: existing?.color ?? nextColor(themes.map((t) => t.color)),
  });

  return NextResponse.json({ ok: true, themeKey: key }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as { id?: string; handle?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 400 });
  }
  await updateHandle(body.id, body.handle?.trim() ?? "");
  return NextResponse.json({ ok: true });
}
