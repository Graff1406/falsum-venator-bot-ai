import bot from '@/providers/bot.provider';
import { generateText } from '@/services';
import {
  getTelegramChannelUsername,
  reducePrompt,
  parseTelegramChannelPosts,
  removeStars,
} from '@/utils';
import {
  CHANNEL_TRACKING_START_PROMPT,
  CHANNEL_POST_ANALYSIS_PROMPT,
  CHANNEL_ALREADY_TRACKING,
  BOT_ROLE_DESCRIPTION,
} from '@/utils/ai-prompt.util';
import { TelegramUrls, DBCollections } from '@/utils/enums.util';
import { db, fb } from '@/providers/firebase.provider';
import { TelegramChannel, AIResPost, TelegramChannelPost } from '@/models';
import { updateTelegramChannelField, getCollectionDocuments } from '@/services';

bot.on('message', async (ctx) => {
  const chatId = ctx.chatId;
  const message = ctx.message.text || '';
  const lang = ctx.from?.language_code || 'en';

  scheduleTelegramPostFetch(600000, async () => {
    const telegramChannels = await getCollectionDocuments<TelegramChannel>(
      DBCollections.TELEGRAM_CHANNELS
    ); // Fetch all telegram channels  from Firestore  every 60 seconds  and store them in the telegramChannels variable

    // console.log('telegramChannels', telegramChannels);

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
        extractedChannelPosts,
        lang
      );

      if (analyzedPosts.length === 0) continue; // If no posts are analyzed, continue to the next channel

      for (const follower of channel.followers) {
        await sendPostsToTelegramChannel(
          analyzedPosts,
          channel.username,
          follower.chat_id
        ); // Send the posts to the channel on the Telegram channel for each follower
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

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
        const data = await generateTextByReducePrompt<string>({
          lang,
          message: CHANNEL_TRACKING_START_PROMPT,
        });
        ctx.reply(data);

        saveUsernameTelegramChannelToFirestore(chatId, telegramChannelUsername);

        const extractedChannelPosts: TelegramChannelPost[] =
          await parseTelegramChannelPosts({
            url: TelegramUrls.dirPostList + telegramChannelUsername,
            countPosts: 3,
          });

        const posts = await analyzeByAITelegramChannelPosts(
          extractedChannelPosts,
          lang
        );

        sendPostsToTelegramChannel(posts, telegramChannelUsername, chatId);
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

function getTelegramChannelId(): string | null {
  const id =
    process.env.NODE_ENV === 'production'
      ? process.env.TELEGRAM_CHANNEL_ID
      : process.env.DEV_TELEGRAM_CHANNEL_ID;

  return id || null;
}

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

async function scheduleTelegramPostFetch(
  interval = 60000,
  callback: () => void
): Promise<NodeJS.Timeout> {
  const intervalId = setInterval(callback, interval);
  return intervalId;
}

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

// Extracts posts from a Telegram channel
async function analyzeByAITelegramChannelPosts(
  posts: TelegramChannelPost[],
  lang: string
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
      lang,
      message: CHANNEL_POST_ANALYSIS_PROMPT,
      payload: JSON.stringify(textOnlyPosts),
    });

    // Clean the JSON data (remove code block markers and trim whitespace)
    const cleanedJson = data.replace(/```json|```/g, '').trim();
    // Parse the cleaned JSON into a Post array
    const parsedPosts: AIResPost[] = JSON.parse(cleanedJson);

    return parsedPosts; // Return the parsed posts
  } catch (error) {
    // Handle JSON parsing errors gracefully
    console.error('🚨 ~ Error parsing JSON:', error);
    return [];
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
