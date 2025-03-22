import bot from '../providers/bot.provider';
import { removeFollowerByUsername } from '../services';
import {
  ERROR_INTERNAL_REQUEST,
  UNSUBSCRIPTION_CONFIRMATION_MESSAGE,
} from '../utils/ai-prompt.util';
import { generateTextByReducePrompt } from '../utils';

bot.on('callback_query:data', async (ctx) => {
  const chatId = ctx.chatId;
  const lang = ctx.from?.language_code || 'en';
  const callbackData = ctx.callbackQuery.data;

  const [button, payload] = callbackData.split(':');

  if (!chatId) {
    const data = await generateTextByReducePrompt<string>({
      lang,
      message: ERROR_INTERNAL_REQUEST,
    });
    ctx.reply(data);
    return;
  }

  switch (button) {
    case 'unsubscribe':
      await removeFollowerByUsername(payload, chatId);
      const data = await generateTextByReducePrompt<string>({
        lang,
        message: UNSUBSCRIPTION_CONFIRMATION_MESSAGE,
      });
      ctx.reply(data);
      break;
  }
});
