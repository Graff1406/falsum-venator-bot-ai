import { Bot } from 'grammy';
import {
  scheduleTelegramPostFetch,
  parseTelegramChannelPosts,
  analyzeByAITelegramChannelPosts,
  sendPostsToTelegramChannel,
} from '@/utils';
import { TelegramUrls, DBCollections } from '@/utils/enums.util';
import { getCollectionDocuments, updateTelegramChannelField } from '@/services';
import { TelegramChannel, TelegramChannelPost } from '@/models';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

async function updateLastMessageTime(
  posts: TelegramChannelPost[],
  channelUsername: string
): Promise<void> {
  const now = new Date().getTime();
  const post = posts.reduce((closest, post) => {
    const postTime = new Date(post.datetime).getTime();
    return Math.abs(postTime - now) <
      Math.abs(new Date(closest.datetime).getTime() - now)
      ? post
      : closest;
  }, posts[0]);
  updateTelegramChannelField(
    channelUsername,
    'last_message_time',
    post.datetime
  );
}

bot.start({
  onStart: async () => {
    const schedule = scheduleTelegramPostFetch();
    // schedule.setNewInterval(900000);
    schedule.start();
    schedule.onTick(async () => {
      try {
        const telegramChannels = await getCollectionDocuments<TelegramChannel>(
          DBCollections.TELEGRAM_CHANNELS
        ); // Fetch all telegram channels  from Firestore  every 60 seconds  and store them in the telegramChannels variable
        // console.log('telegramChannels', telegramChannels);
        console.log('telegramChannels');
        if (!telegramChannels) return; // If no telegram channels are found, return immediately and           do nothing  else, iterate over each channel
        for (const channel of telegramChannels) {
          const extractedChannelPosts: TelegramChannelPost[] =
            await parseTelegramChannelPosts({
              url: TelegramUrls.dirPostList + channel.username,
              fromDatetime: channel.last_message_time,
            }); // Extract posts from the channel
          if (extractedChannelPosts.length === 0) continue; // If no posts are found, continue to the next channel
          await updateLastMessageTime(extractedChannelPosts, channel.username);
          const analyzedPosts = await analyzeByAITelegramChannelPosts(
            extractedChannelPosts
          );
          if (analyzedPosts.length === 0) continue; // If no posts are analyzed, continue to the next channel
          for (const follower of channel.followers) {
            await sendPostsToTelegramChannel(
              extractedChannelPosts,
              analyzedPosts,
              channel.username,
              follower.chat_id
            ); // Send the posts to the channel on the Telegram channel for each follower
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        if (process.env.MY_TELEGRAM_ID)
          bot.api.sendMessage(process.env.MY_TELEGRAM_ID, 'onTick: ' + error);
        schedule.stop();
        console.error('Error fetching posts:', error);
      }
    });
    console.log('Bot started');
  },
});

export default bot;
