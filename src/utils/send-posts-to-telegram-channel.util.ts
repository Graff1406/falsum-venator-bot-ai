import bot from '../providers/bot.provider';
import { AIResPost, TelegramChannelPost } from '../models';
import { TelegramUrls } from './enums.util';
import { removeStars } from './fix-markdown.util';

function getTelegramChannelId(): string | null {
  const id =
    process.env.NODE_ENV === 'production'
      ? process.env.TELEGRAM_CHANNEL_ID
      : process.env.DEV_TELEGRAM_CHANNEL_ID;

  return id || null;
}

export async function sendPostsToTelegramChannel(
  extractedChannelPosts: TelegramChannelPost[],
  posts: AIResPost[],
  telegramChannelUsername: string,
  chatId: number
): Promise<void> {
  const telegramChannelId = getTelegramChannelId();
  if (!telegramChannelId) return;

  const reducePosts = posts.map((post) => {
    return {
      ...post,
      author: extractedChannelPosts.find((p) => p.post_id === post.post_id)
        ?.author,
    };
  }) as AIResPost[];
  // Loop over each post to send and forward it
  for (const post of reducePosts) {
    let message;
    const postURL = `${TelegramUrls.baseURL + telegramChannelUsername}/${post.post_id}`;
    const author = post?.author?.replace(/[^\p{L}\p{N} ]/gu, '').trim();
    const prompt = `*${author}*: [${post.title}](${postURL})\n\n${post.text}\n\n`;

    try {
      // Attempt to send the message with Markdown formatting
      message = await bot.api.sendMessage(telegramChannelId, prompt, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      // If sending fails, remove stars and send as plain text
      message = await bot.api.sendMessage(
        telegramChannelId,
        removeStars(prompt)
      );
      console.error('Error sending message:', error);
    }

    // If the message was successfully sent, forward it to the specified chat
    if (message) {
      await bot.api.forwardMessage(
        chatId,
        telegramChannelId,
        message.message_id
      );
    }
  }
}
