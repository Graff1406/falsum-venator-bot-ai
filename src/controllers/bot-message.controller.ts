import bot from '@/providers/bot.provider';
import { generateText } from '@/services/generateText.services';
import {
  getTelegramChannelUsername,
  reducePrompt,
  parseTelegramChannelPosts,
  removeStars,
} from '@/utils';
import {
  CHANNEL_TRACKING_START_PROMPT,
  CHANNEL_POST_ANALYSIS_PROMPT,
  CHANNEL_ALREADY_TRACKING_MESSAGE,
  BOT_ROLE_DESCRIPTION,
} from '@/utils/ai-prompt.util';
import { TelegramUrls } from '@/utils/enums.util';
import { db, fb } from '@/providers/firebase.provider';
import { TelegramChannel, AIResPost } from '@/models';

bot.on('message', async (ctx) => {
  try {
    const chatId = ctx.chatId;
    const message = ctx.message.text || '';
    const lang = ctx.from?.language_code || 'en';

    const telegramChannelUsername = getTelegramChannelUsername(message);

    if (typeof telegramChannelUsername === 'string') {
      const hasSavedUsername = await checkChannelAndChatId(
        chatId,
        telegramChannelUsername
      );

      if (hasSavedUsername) {
        const data = await generateTextByReducePrompt<string>({
          lang,
          message: CHANNEL_ALREADY_TRACKING_MESSAGE,
        });
        ctx.reply(data);
      } else {
        sendMessageToChannelAndForward(chatId, lang);
        saveUsernameTelegramChannelToFirestore(chatId, telegramChannelUsername);

        const posts = await extractTelegramChannelPosts(
          telegramChannelUsername,
          lang
        );

        sendPostsToTelegramChannel(posts, telegramChannelUsername, chatId);
      }
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

async function generateTextByReducePrompt<T>({
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

async function sendPostsToTelegramChannel(
  posts: AIResPost[],
  telegramChannelUsername: string,
  chatId: number
): Promise<void> {
  if (!process.env.TELEGRAM_CHANNEL_ID) return;
  // Loop over each post to send and forward it
  for (const post of posts) {
    let message;
    const postURL = `${TelegramUrls.baseURL + telegramChannelUsername}/${post.post_id}`;

    try {
      // Attempt to send the message with Markdown formatting
      message = await bot.api.sendMessage(
        process.env.TELEGRAM_CHANNEL_ID,
        `${post.text}\n\n${postURL}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      // If sending fails, remove stars and send as plain text
      message = await bot.api.sendMessage(
        process.env.TELEGRAM_CHANNEL_ID,
        removeStars(`${post.text}\n\n${postURL}`)
      );
      console.error('Error sending message:', error);
    }

    // If the message was successfully sent, forward it to the specified chat
    if (message) {
      await bot.api.forwardMessage(
        chatId,
        process.env.TELEGRAM_CHANNEL_ID,
        message.message_id
      );
    }
  }
}

// Extracts posts from a Telegram channel
async function extractTelegramChannelPosts(
  telegramChannelUsername: string,
  lang: string
): Promise<AIResPost[]> {
  // Fetch the posts from the Telegram channel
  const extractedChannelPosts = await parseTelegramChannelPosts(
    TelegramUrls.dirPostList + telegramChannelUsername,
    1
  );

  // Return an empty array if no posts were fetched
  if (!extractedChannelPosts || extractedChannelPosts.length === 0) return [];

  // Map over the posts to extract only the relevant fields
  const textOnlyPosts: AIResPost[] = extractedChannelPosts.map(
    ({ text, post_id }) => ({
      text,
      post_id,
    })
  );

  // Generate the analysis data
  const data = await generateTextByReducePrompt<string>({
    lang,
    message: CHANNEL_POST_ANALYSIS_PROMPT,
    payload: JSON.stringify(textOnlyPosts),
  });

  // Clean the JSON data (remove code block markers and trim whitespace)
  const cleanedJson = data.replace(/```json|```/g, '').trim();

  try {
    // Parse the cleaned JSON into a Post array
    const parsedPosts: AIResPost[] = JSON.parse(cleanedJson);

    return parsedPosts; // Return the parsed posts
  } catch (error) {
    // Handle JSON parsing errors gracefully
    console.error('🚨 ~ Error parsing JSON:', error);
    return [];
  }
}

async function sendMessageToChannelAndForward(chatId: number, lang: string) {
  const data = await generateTextByReducePrompt<string>({
    lang,
    message: CHANNEL_TRACKING_START_PROMPT,
  });
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

async function saveUsernameTelegramChannelToFirestore(
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

async function checkChannelAndChatId(
  chatId: number,
  username: string
): Promise<boolean> {
  try {
    // Получаем ссылку на коллекцию telegramChannels
    const telegramChannelsRef = db.collection('telegramChannels');

    // Запрашиваем документ, где поле username равно переданному значению
    const querySnapshot = await telegramChannelsRef
      .where('username', '==', username)
      .get();

    if (querySnapshot.empty) {
      // Если не найдено ни одного документа с таким username
      console.log('No such channel found');
      return false;
    }

    // Перебираем все найденные документы (может быть несколько)
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const followers = data.followers || [];

      // Проверяем, содержится ли объект с нужным chat_id в массиве followers
      const isChatIdFound = followers.some(
        (follower: { chat_id: number }) => follower.chat_id === chatId
      );

      if (isChatIdFound) {
        console.log('Found chat_id in followers');
        return true;
      }
    }

    // Если не найдено соответствующего chat_id
    console.log('No such chat_id found in followers');
    return false;
  } catch (error) {
    console.error('Error checking channel and chat_id:', error);
    return false;
  }
}
