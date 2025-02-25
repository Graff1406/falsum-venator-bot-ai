import bot from '@/providers/bot.provider';
import { generateText } from '@/services/generateText.services';
import {
  getTelegramChannelUsername,
  reducePrompt,
  parseTelegramChannelPosts,
} from '@/utils';
import {
  CHANNEL_TRACKING_START_PROMPT,
  CHANNEL_POST_ANALYSIS_PROMPT,
} from '@/utils/ai-prompt.util';
import { TelegramUrls } from '@/utils/enums.util';
import { db, fb } from '@/providers/firebase.provider';
import { TelegramChannel } from '@/models/firestore-collection.model';

bot.on('message', async (ctx) => {
  try {
    const chatId = ctx.chatId;
    const message = ctx.message.text || '';
    const lang = ctx.from?.language_code || 'en';

    const telegramChannelUsername = getTelegramChannelUsername(message);

    if (typeof telegramChannelUsername === 'string') {
      sendMessageToChannelAndForward(chatId, lang);
      savePassedTelegramChannel(chatId, telegramChannelUsername);
      const extractedChannelPosts = await parseTelegramChannelPosts(
        TelegramUrls.dirPostList + telegramChannelUsername
      );
      const textOnlyPosts = extractedChannelPosts?.map(
        (post: { text: string; post_id: string }) => ({
          text: post.text,
          post_id: post.post_id,
        })
      );
      console.log('🚀 ~ bot.on ~ textOnlyPosts:', textOnlyPosts);
      const prompt = reducePrompt({
        lang,
        message: CHANNEL_POST_ANALYSIS_PROMPT,
        payload: JSON.stringify(textOnlyPosts?.filter((_, i) => i === 1)),
      });
      const { data } = await generateText<string>({
        prompt,
      });
      console.log('🚀 ~ bot.on ~ data:', data);
      const cleanedJson = data
        .toString()
        .replace(/```json|```/g, '')
        .trim();

      const posts: { text: string; post_id: string }[] =
        JSON.parse(cleanedJson);
      console.log('🚀 ~ bot.on ~ posts:', posts);

      if (process.env.TELEGRAM_CHANNEL_ID) {
        for (let post of posts) {
          const postURL = `${TelegramUrls.baseURL + telegramChannelUsername}/${post.post_id}`;
          const message = await bot.api.sendMessage(
            process.env.TELEGRAM_CHANNEL_ID,
            `${post.text}\n\n${postURL}`,
            {
              parse_mode: 'Markdown',
            }
          );
          await bot.api.forwardMessage(
            chatId,
            process.env.TELEGRAM_CHANNEL_ID,
            message.message_id
          );
        }
      }

      return;
    }

    const result = await generateText<string>({ prompt: message });
    ctx.reply(result.data);
  } catch (error) {
    console.log(error);
  }
});

async function sendMessageToChannelAndForward(chatId: number, lang: string) {
  const prompt = reducePrompt({
    lang,
    message: CHANNEL_TRACKING_START_PROMPT,
  });
  const { data } = await generateText<string>({ prompt });
  // ctx.reply(data);

  if (process.env.TELEGRAM_CHANNEL_ID) {
    const message = await bot.api.sendMessage(
      process.env.TELEGRAM_CHANNEL_ID,
      data
    );
    const savedMessageId = message.message_id;
    await bot.api.forwardMessage(
      chatId,
      process.env.TELEGRAM_CHANNEL_ID,
      savedMessageId
    );
  }
}

async function savePassedTelegramChannel(
  chatId: number,
  username: string
): Promise<void> {
  const channelsRef = db.collection('telegramChannels');

  try {
    // Search for a document with the specified username
    const querySnapshot = await channelsRef
      .where('username', '==', username)
      .get();

    if (!querySnapshot.empty) {
      // If a document with the specified username is found
      const doc = querySnapshot.docs[0];
      const channelData = doc.data();

      // Check if the chatId already exists in the followers array
      const existingFollower = channelData.followers.find(
        (follower: { chat_id: number }) => follower.chat_id === chatId
      );

      if (!existingFollower) {
        // If chatId doesn't exist, add it to the followers
        await doc.ref.update({
          followers: [...channelData.followers, { chat_id: chatId }],
        });
      }
    } else {
      // If no document with the specified username is found, create a new one
      const channel: TelegramChannel = {
        created_at: fb.firestore.Timestamp.now(),
        username,
        followers: [{ chat_id: chatId }],
      };
      await channelsRef.add(channel);
    }
  } catch (error) {
    console.error('Error updating or adding document: ', error);
  }
}
