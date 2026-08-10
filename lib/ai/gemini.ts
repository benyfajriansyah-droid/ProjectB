import { GoogleGenerativeAI } from "@google/generative-ai";
import { TEMAS, platformsForTema, type Platform, type TemaId } from "../constants";
import type { IdeaParser } from "./parse";

export const MISSING_GEMINI_KEY_MESSAGE =
  "Setup belum lengkap: GEMINI_API_KEY belum diisi. " +
  "Ambil key gratis di https://aistudio.google.com/apikey, " +
  "tambahkan di Vercel > Settings > Environment Variables, lalu Redeploy.";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error(MISSING_GEMINI_KEY_MESSAGE);
  return new GoogleGenerativeAI(apiKey);
}

const temaList = TEMAS.map((t) => `- ${t.id}: ${t.label}`).join("\n");

type RawGeminiResponse = {
  hook: string;
  tema: string;
  platforms: { platform: string; format: string }[];
};

function buildPrompt(rawText: string): string {
  return `Kamu membantu content creator mengorganisir ide konten mentah menjadi data terstruktur.

Tema yang tersedia (pilih salah satu id):
${temaList}

Dari teks ide di bawah, tentukan:
1. "hook": ringkasan singkat ide ini, maksimal 10 kata, bahasa Indonesia.
2. "tema": id tema yang paling cocok dari daftar di atas.
3. "platforms": daftar platform yang relevan untuk ide ini ("ig" dan/atau "tiktok"), masing-masing dengan "format" singkat (mis. "reels", "carousel", "story", "video").

Balas HANYA dengan JSON, tanpa penjelasan tambahan, dengan bentuk persis:
{"hook": string, "tema": string, "platforms": [{"platform": "ig" | "tiktok", "format": string}]}

Teks ide:
"""
${rawText}
"""`;
}

export const geminiParser: IdeaParser = {
  async parse(rawText) {
    const genAI = client();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(buildPrompt(rawText));
    const raw = JSON.parse(result.response.text()) as RawGeminiResponse;

    const tema: TemaId = TEMAS.some((t) => t.id === raw.tema)
      ? (raw.tema as TemaId)
      : TEMAS[0].id;
    const allowedPlatforms = new Set(platformsForTema(tema));

    const executions = (raw.platforms ?? [])
      .filter((p) => allowedPlatforms.has(p.platform as Platform))
      .map((p) => ({ platform: p.platform as Platform, format: p.format || "video" }));

    return {
      hook: raw.hook?.trim() || rawText.slice(0, 60),
      tema,
      executions:
        executions.length > 0
          ? executions
          : Array.from(allowedPlatforms).map((platform) => ({ platform, format: "video" })),
    };
  },
};
