import bot from '@/providers/bot.provider';
import { generateText } from '@/services/generateText.services';
import { containsTelegramLink, reducePrompt } from '@/utils';
import { CHANNEL_TRACKING_START_PROMPT } from '@/utils/ai-prompt.util';
import { db } from '@/providers/firebase.provider';

bot.on('message', async (ctx) => {
  try {
    // const chatId = ctx.chatId;
    const message = ctx.message.text || '';
    const lang = ctx.from?.language_code || 'en';

    addDataToFirestore();
    return;

    const textHasTelLink = containsTelegramLink(message);

    if (textHasTelLink) {
      handlePassedTelegramLinkToMessage(ctx, lang);
      return;
    }

    const result = await generateText<string>({ prompt: message });
    ctx.reply(result.data);
  } catch (error) {
    console.log(error);
  }
});

async function handlePassedTelegramLinkToMessage(ctx: any, lang: string) {
  const chatId = ctx.chatId;
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
    console.log('🚀 ~ handlePassedTelegramLinkToMessage ~ message:', message);
  }
}

//Example of using Firestore:

async function addDataToFirestore() {
  try {
    const docRef = await db
      .collection('yourCollection')
      .add({ name: 'Example Name', value: 1 });
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}
