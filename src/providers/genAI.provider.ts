import {
  GoogleGenerativeAI,
  GenerationConfig,
  ResponseSchema,
} from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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
  | ModelType.Gemini1_5_Flash
  | ModelType.Gemini1_5_Flash_8b_001
  | ModelType.Gemini1_5_Flash_002
  | ModelType.Gemini1_5_Pro
  | ModelType.Gemini1_5_Pro_002
  | ModelType.TextEmbedding_004
  | ModelType.GeminiExp_1121
  | ModelType.Gemini_2_0_flash
  | ModelType.Gemini_2_0_flash_lite_preview_02_05;

export enum ModelType {
  Gemini1_5_Flash = 'gemini-1.5-flash',
  Gemini1_5_Flash_8b_001 = 'gemini-1.5-flash-8b-001',
  Gemini1_5_Flash_002 = 'gemini-1.5-flash-002',
  Gemini1_5_Pro_002 = 'gemini-1.5-pro-002',
  Gemini1_5_Pro = 'gemini-1.5-pro',
  TextEmbedding_004 = 'text-embedding-004',
  GeminiExp_1121 = 'gemini-exp-1121',
  Gemini_2_0_flash = 'gemini-2.0-flash',
  Gemini_2_0_flash_lite_preview_02_05 = 'gemini-2.0-flash-lite-preview-02-05',
}
