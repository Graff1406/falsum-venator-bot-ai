import { CHANNEL_POST_ANALYSIS_PROMPT } from '../utils/ai-prompt.util';

import { generateTextByReducePrompt } from '../utils/generate-text-by-reduce-prompt.util';
import { AIResPost, TelegramChannelPost } from '../models';
export async function analyzeByAITelegramChannelPosts(
  posts: TelegramChannelPost[],
  lang?: string
): Promise<AIResPost[]> {
  // Fetch the posts from the Telegram channel

  // Return an empty array if no posts were fetched
  if (!posts || posts.length === 0) return [];

  // Map over the posts to extract only the relevant fields
  const textOnlyPosts: { text: string; post_id: string }[] = posts.map(
    ({ text, post_id }) => ({
      text,
      post_id,
    })
  );

  try {
    // Generate the analysis data
    const data = await generateTextByReducePrompt<string>({
      lang:
        lang || 'answer return to me in the language of the text transmitted',
      message: CHANNEL_POST_ANALYSIS_PROMPT,
      payload: JSON.stringify(textOnlyPosts),
    });

    try {
      // Clean the JSON data (remove code block markers and trim whitespace)
      const cleanedJson = data.replace(/```json|```/g, '').trim();

      // Parse the cleaned JSON into a Post array
      const parsedPosts: AIResPost[] = JSON.parse(cleanedJson);
      return parsedPosts; // Return the parsed posts
    } catch (err) {
      // Handle JSON parsing errors gracefully
      console.error('🚨 ~ Error parsing JSON:', data);
      return [];
    }
  } catch (error) {
    // Handle JSON parsing errors gracefully
    console.error('🚨 ~ Error parsing JSON:', error);
    return [];
  }
}
