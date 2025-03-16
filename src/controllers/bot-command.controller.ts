import { InlineKeyboard } from 'grammy';
import bot from '../providers/bot.provider';
import {
  removeFollowerFromAllChannels,
  getUsernamesByFollowerId,
} from '../services';
import { Commands, TelegramUrls, generateTextByReducePrompt } from '../utils';
import { ALL_SUBSCRIBES_DELETED } from '../utils/ai-prompt.util';

// bot.api.setMyCommands([
//   { command: 'subscribes', description: 'Subscribes' },
//   { command: 'remove_all_subscribes', description: 'Remove all subscribes' },
// ]);

bot.command(Commands.SUBSCRIBES, async (ctx) => {
  const chatId = ctx.chatId;
  const users = await getUsernamesByFollowerId(chatId);

  const inlineKeyboard = new InlineKeyboard().text(
    'Unsubscribe',
    'unsubscribe'
  );

  for (const username of users) {
    await ctx.reply(`${TelegramUrls.baseURL + username}`, {
      reply_markup: inlineKeyboard,
    });
  }
});

bot.command(Commands.REMOVE_ALL_SUBSCRIBES, async (ctx) => {
  const chatId = ctx.chatId;
  const lang = ctx.from?.language_code || 'en';

  await removeFollowerFromAllChannels(chatId);
  const data = await generateTextByReducePrompt<string>({
    lang,
    message: ALL_SUBSCRIBES_DELETED,
  });

  ctx.reply(data);
});
