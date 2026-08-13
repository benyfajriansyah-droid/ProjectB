import { GoogleGenAI, Type } from "@google/genai";
import type { Platform } from "../constants";
import type { Theme } from "../accounts";
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

/**
 * Constrains the model's output shape so a malformed reply can't reach the
 * parser — the API rejects anything off-schema before we see it.
 */
function responseSchema(themes: Theme[]) {
  return {
  type: Type.OBJECT,
  properties: {
    hook: { type: Type.STRING },
    tema: { type: Type.STRING, enum: themes.map((t) => t.key) },
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
}

type RawResponse = {
  hook: string;
  tema: string;
  platforms: { platform: string; format: string }[];
};

function buildPrompt(rawText: string, themes: Theme[]): string {
  const temaList = themes.map((t) => `- ${t.key}: ${t.label}`).join("\n");
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
  async parse(rawText, themes) {
    const ai = client();

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
      contents: buildPrompt(rawText, themes),
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema(themes),
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini tidak mengembalikan jawaban (kemungkinan diblokir filter konten).");
    }

    const raw = JSON.parse(text) as RawResponse;

    const picked = themes.find((t) => t.key === raw.tema) ?? themes[0];
    const tema = picked.key;
    const allowedPlatforms = new Set(picked.accounts.map((a) => a.platform));

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
