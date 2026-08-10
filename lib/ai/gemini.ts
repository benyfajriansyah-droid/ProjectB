import { GoogleGenAI, Type } from "@google/genai";
import { TEMAS, platformsForTema, type Platform, type TemaId } from "../constants";
import type { IdeaParser } from "./parse";

export const MISSING_GEMINI_KEY_MESSAGE =
  "Setup belum lengkap: GEMINI_API_KEY belum diisi. " +
  "Ambil key gratis di https://aistudio.google.com/apikey, " +
  "tambahkan di Vercel > Settings > Environment Variables, lalu Redeploy.";

const DEFAULT_MODEL = "gemini-flash-latest";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error(MISSING_GEMINI_KEY_MESSAGE);
  return new GoogleGenAI({ apiKey });
}

const temaList = TEMAS.map((t) => `- ${t.id}: ${t.label}`).join("\n");

/**
 * Constrains the model's output shape so a malformed reply can't reach the
 * parser — the API rejects anything off-schema before we see it.
 */
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    hook: { type: Type.STRING },
    tema: { type: Type.STRING, enum: TEMAS.map((t) => t.id) },
    platforms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, enum: ["ig", "tiktok"] },
          format: { type: Type.STRING },
        },
        required: ["platform", "format"],
      },
    },
  },
  required: ["hook", "tema", "platforms"],
};

type RawResponse = {
  hook: string;
  tema: string;
  platforms: { platform: string; format: string }[];
};

function buildPrompt(rawText: string): string {
  return `Kamu membantu content creator mengorganisir ide konten mentah menjadi data terstruktur.

Tema yang tersedia (pilih salah satu id):
${temaList}

Dari teks ide di bawah, tentukan:
1. "hook": ringkasan singkat ide ini, maksimal 10 kata, bahasa Indonesia, ditulis menarik seperti judul konten.
2. "tema": id tema yang paling cocok dari daftar di atas.
3. "platforms": platform yang relevan ("ig" dan/atau "tiktok"), masing-masing dengan "format" singkat (mis. "reels", "carousel", "story", "video").

Teks ide:
"""
${rawText}
"""`;
}

export const geminiParser: IdeaParser = {
  async parse(rawText) {
    const ai = client();

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
      contents: buildPrompt(rawText),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini tidak mengembalikan jawaban (kemungkinan diblokir filter konten).");
    }

    const raw = JSON.parse(text) as RawResponse;

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
