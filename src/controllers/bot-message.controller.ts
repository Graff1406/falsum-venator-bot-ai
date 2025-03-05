import bot from '@/providers/bot.provider';
import {
  getTelegramChannelUsername,
  parseTelegramChannelPosts,
  generateTextByReducePrompt,
  analyzeByAITelegramChannelPosts,
  sendPostsToTelegramChannel,
} from '@/utils';
import {
  CHANNEL_TRACKING_START_PROMPT,
  CHANNEL_ALREADY_TRACKING,
  BOT_ROLE_DESCRIPTION,
} from '@/utils/ai-prompt.util';
import { TelegramUrls } from '@/utils/enums.util';
import { db, fb } from '@/providers/firebase.provider';
import { TelegramChannel, TelegramChannelPost, AIResPost } from '@/models';

bot.on('message', async (ctx) => {
  const chatId = ctx.chatId;
  const message = ctx.message.text || '';
  const lang = ctx.from?.language_code || 'en';

  try {
    const telegramChannelUsername = getTelegramChannelUsername(message);

    if (typeof telegramChannelUsername === 'string') {
      const hasSavedUsername = await checkChannelAndChatId(
        chatId,
        telegramChannelUsername
      );

      if (hasSavedUsername) {
        const data = await generateTextByReducePrompt<string>({
          lang,
          message: CHANNEL_ALREADY_TRACKING,
        });
        ctx.reply(data);
      } else {
        console.log('Error');
        const data = await generateTextByReducePrompt<string>({
          lang,
          message: CHANNEL_TRACKING_START_PROMPT,
        });
        ctx.reply(data);

        saveUsernameTelegramChannelToFirestore(
          chatId,
          lang,
          telegramChannelUsername
        );

        const extractedChannelPosts: TelegramChannelPost[] =
          await parseTelegramChannelPosts({
            url: TelegramUrls.dirPostList + telegramChannelUsername,
            countPosts: 3,
          });

        const posts = await analyzeByAITelegramChannelPosts(
          extractedChannelPosts,
          lang
        );

        sendPostsToTelegramChannel(
          extractedChannelPosts,
          posts,
          telegramChannelUsername,
          chatId
        );
      }
      return;
    }
    const data = await generateTextByReducePrompt<string>({
      lang,
      message,
      payload: BOT_ROLE_DESCRIPTION,
    });
    ctx.reply(data);
  } catch (error) {
    console.log(error);
  }
});

// Extracts posts from a Telegram channel

async function saveUsernameTelegramChannelToFirestore(
  chatId: number,
  lang: string,
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
        followers: [{ chat_id: chatId, lang }],
      };
      await channelsRef.add(channel);
    }
  } catch (error) {
    console.error('Error updating or adding document: ', error);
  }
}

async function checkChannelAndChatId(
  chatId: number,
  username: string
): Promise<boolean> {
  try {
    // Get a reference to the telegramChannels collection
    const telegramChannelsRef = db.collection('telegramChannels');

    // Query the document where the username field matches the passed value
    const querySnapshot = await telegramChannelsRef
      .where('username', '==', username)
      .get();

    if (querySnapshot.empty) {
      // If no document with the specified username is found
      console.log('No such channel found');
      return false;
    }

    // Iterate over all found documents (there may be several)
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const followers = data.followers || [];

      // Check if the object with the required chat_id is in the followers array
      const isChatIdFound = followers.some(
        (follower: { chat_id: number }) => follower.chat_id === chatId
      );

      if (isChatIdFound) {
        console.log('Found chat_id in followers');
        return true;
      }
    }

    // If the corresponding chat_id is not found
    console.log('No such chat_id found in followers');
    return false;
  } catch (error) {
    console.error('Error checking channel and chat_id:', error);
    return false;
  }
}
