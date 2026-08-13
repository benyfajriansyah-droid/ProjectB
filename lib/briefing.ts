import { GoogleGenAI } from "@google/genai";
import { query } from "./db";
import { TARGET_BULANAN, formatRupiah, monthlySummaries, ventureTotalsThisMonth } from "./finance";
import { accountStates, listSnapshots } from "./social";
import { listIdeas } from "./ideas";
import { TEMAS, PLATFORM_LABELS, temaLabel } from "./constants";

export type Briefing = { body: string; date: string };

function today(): string {
  // Anchored to Jakarta so the briefing rolls over at local midnight.
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Everything the model is allowed to reason from, as plain text. */
async function gatherFacts(): Promise<string> {
  const [months, ventures, snapshots, ideas] = await Promise.all([
    monthlySummaries(3),
    ventureTotalsThisMonth(),
    listSnapshots(60),
    listIdeas(),
  ]);

  const current = months[0];
  const lines: string[] = [];

  lines.push(`Target pemasukan: ${formatRupiah(TARGET_BULANAN)} per bulan.`);

  if (current) {
    const sisa = Math.max(TARGET_BULANAN - current.masuk, 0);
    lines.push(
      `Bulan ini: masuk ${formatRupiah(current.masuk)}, keluar ${formatRupiah(current.keluar)}, bersih ${formatRupiah(current.bersih)}. Kurang ${formatRupiah(sisa)} lagi dari target.`,
    );
  } else {
    lines.push("Belum ada catatan keuangan sama sekali.");
  }

  if (months.length > 1) {
    lines.push(
      `Bulan sebelumnya: ${months
        .slice(1)
        .map((m) => `${m.month} masuk ${formatRupiah(m.masuk)}`)
        .join(", ")}.`,
    );
  }

  if (ventures.length > 0) {
    lines.push(
      `Sumber pemasukan bulan ini: ${ventures
        .map((v) => `${v.venture} ${formatRupiah(v.masuk)}`)
        .join(", ")}.`,
    );
  }

  const states = accountStates(snapshots);
  if (states.size > 0) {
    const parts: string[] = [];
    for (const state of states.values()) {
      if (!state.latest) continue;
      const growth =
        state.previous?.followers != null && state.latest.followers != null
          ? ` (${state.latest.followers - state.previous.followers >= 0 ? "+" : ""}${state.latest.followers - state.previous.followers} sejak catatan sebelumnya)`
          : "";
      parts.push(
        `${temaLabel(state.tema)} di ${PLATFORM_LABELS[state.platform]}: ${state.latest.followers ?? "?"} follower${growth}`,
      );
    }
    if (parts.length) lines.push(`Sosial media: ${parts.join("; ")}.`);
  } else {
    lines.push("Belum ada catatan angka sosial media.");
  }

  const executions = ideas.flatMap((i) => i.executions);
  lines.push(
    `Konten: ${ideas.length} ide tersimpan di ${TEMAS.length} tema — ` +
      `${executions.filter((e) => e.status === "ide_baru").length} belum digarap, ` +
      `${executions.filter((e) => e.status === "draft").length} draft, ` +
      `${executions.filter((e) => e.status === "terjadwal").length} terjadwal, ` +
      `${executions.filter((e) => e.status === "tayang").length} sudah tayang.`,
  );

  return lines.join("\n");
}

function buildPrompt(facts: string): string {
  return `Kamu asisten produktivitas pribadi untuk seorang content creator Indonesia yang sedang mengejar pemasukan 10 juta rupiah per bulan.

Data hari ini:
${facts}

Tulis briefing harian yang singkat dan langsung berguna, dalam bahasa Indonesia santai (pakai "lo"), maksimal 150 kata:
1. Satu kalimat kondisi saat ini — jujur, tanpa basa-basi motivasi kosong.
2. Tepat 3 langkah konkret yang bisa dikerjakan hari ini untuk mendekati target, diambil dari data di atas. Sebutkan angka kalau relevan.

Aturan: jangan mengarang data yang tidak ada di atas. Kalau datanya masih kosong, bilang apa yang perlu dicatat dulu. Jangan pakai heading, jangan pakai penutup basa-basi.`;
}

async function generate(facts: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diisi.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    contents: buildPrompt(facts),
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Gemini tidak mengembalikan jawaban.");
  return text;
}

export async function getCachedBriefing(): Promise<Briefing | null> {
  const rows = await query("SELECT body FROM briefings WHERE briefing_on = $1", [today()]);
  const body = rows[0]?.body as string | undefined;
  return body ? { body, date: today() } : null;
}

/** Generates and stores today's briefing, reusing it if one already exists. */
export async function buildBriefing(force = false): Promise<Briefing> {
  if (!force) {
    const cached = await getCachedBriefing();
    if (cached) return cached;
  }

  const body = await generate(await gatherFacts());
  await query(
    `INSERT INTO briefings (briefing_on, body) VALUES ($1, $2)
     ON CONFLICT (briefing_on) DO UPDATE SET body = EXCLUDED.body, created_at = now()`,
    [today(), body],
  );
  return { body, date: today() };
}
