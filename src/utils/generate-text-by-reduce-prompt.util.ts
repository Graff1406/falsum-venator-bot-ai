import { reducePrompt } from '@/utils';
import { generateText } from '@/services';
export async function generateTextByReducePrompt<T>({
  lang,
  message,
  payload,
}: {
  lang: string;
  message: string;
  payload?: string;
}): Promise<T> {
  const { data } = await generateText<T>({
    prompt: reducePrompt({ lang, message, payload }),
  });
  return data;
}
