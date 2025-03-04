import bot from '@/providers/bot.provider';
import { AIResPost } from '@/models';
import { TelegramUrls } from '@/utils/enums.util';
import { removeStars } from '@/utils/fix-markdown.util';

function getTelegramChannelId(): string | null {
  const id =
    process.env.NODE_ENV === 'production'
      ? process.env.TELEGRAM_CHANNEL_ID
      : process.env.DEV_TELEGRAM_CHANNEL_ID;

  return id || null;
}

export async function sendPostsToTelegramChannel(
  posts: AIResPost[],
  telegramChannelUsername: string,
  chatId: number
): Promise<void> {
  const telegramChannelId = getTelegramChannelId();
  if (!telegramChannelId) return;
  // Loop over each post to send and forward it
  for (const post of posts) {
    let message;
    const postURL = `${TelegramUrls.baseURL + telegramChannelUsername}/${post.post_id}`;

    try {
      // Attempt to send the message with Markdown formatting
      message = await bot.api.sendMessage(
        telegramChannelId,
        `🔗 [${post.title}](${postURL})\n${post.text}\n\n`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      // If sending fails, remove stars and send as plain text
      message = await bot.api.sendMessage(
        telegramChannelId,
        removeStars(`${post.text}\n\n${postURL}`)
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
