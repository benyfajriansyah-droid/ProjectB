import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/finance";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    kind?: "masuk" | "keluar";
    amount?: number;
    category?: string;
    venture?: string;
    note?: string;
    occurredOn?: string;
  };

  if (!body.kind || (body.kind !== "masuk" && body.kind !== "keluar")) {
    return NextResponse.json({ error: "Jenis transaksi tidak valid" }, { status: 400 });
  }
  if (!body.amount || !Number.isFinite(body.amount) || body.amount <= 0) {
    return NextResponse.json({ error: "Nominal harus lebih dari 0" }, { status: 400 });
  }
  if (!body.category || !body.occurredOn) {
    return NextResponse.json({ error: "Kategori dan tanggal wajib diisi" }, { status: 400 });
  }

  const id = await createTransaction({
    kind: body.kind,
    amount: body.amount,
    category: body.category,
    venture: body.venture,
    note: body.note,
    occurredOn: body.occurredOn,
  });

  return NextResponse.json({ id }, { status: 201 });
}
