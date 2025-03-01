import {
  GoogleGenerativeAI,
  GenerationConfig,
  ResponseSchema,
} from '@google/generative-ai';

import { GeminiModels } from '@/utils';

export const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || ''
);

export interface GenerateOptions {
  prompt: string;
  modelType?: Model;
  generationConfig?: ModelOptions;
  history?: { role: string; parts: { text: string }[] }[];
}

interface ModelOptions extends GenerationConfig {
  responseMimeType?: string;
  responseSchema?: ResponseSchema;
}

export type Model =
  | GeminiModels.Gemini_2_0_flash
  | GeminiModels.Gemini_2_0_flash_lite_preview_02_05;
