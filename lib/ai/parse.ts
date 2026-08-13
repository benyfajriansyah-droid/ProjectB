import type { Platform } from "../constants";
import type { Theme } from "../accounts";

export type ParsedExecution = { platform: Platform; format: string };

export type ParsedIdea = {
  hook: string;
  tema: string;
  executions: ParsedExecution[];
};

export interface IdeaParser {
  parse(rawText: string, themes: Theme[]): Promise<ParsedIdea>;
}

/**
 * Single swap point for the AI provider. Fase 1 pakai Gemini (gratis);
 * fase 2 tinggal ganti import ini ke implementasi Claude.
 */
export async function parseIdeaText(rawText: string, themes: Theme[]): Promise<ParsedIdea> {
  const { geminiParser } = await import("./gemini");
  return geminiParser.parse(rawText, themes);
}
