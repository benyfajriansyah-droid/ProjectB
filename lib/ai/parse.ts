import type { Platform, TemaId } from "../constants";

export type ParsedExecution = { platform: Platform; format: string };

export type ParsedIdea = {
  hook: string;
  tema: TemaId;
  executions: ParsedExecution[];
};

export interface IdeaParser {
  parse(rawText: string): Promise<ParsedIdea>;
}

/**
 * Single swap point for the AI provider. Fase 1 pakai Gemini (gratis);
 * fase 2 tinggal ganti import ini ke implementasi Claude.
 */
export async function parseIdeaText(rawText: string): Promise<ParsedIdea> {
  const { geminiParser } = await import("./gemini");
  return geminiParser.parse(rawText);
}
