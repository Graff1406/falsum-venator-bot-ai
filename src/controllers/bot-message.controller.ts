import bot from '@/providers/bot.provider';
import { generateText } from '@/services/generateText.services';
import { Commands } from '@/utils/enums.util';

const commands: string[] = [`/${Commands.start}`];

bot.on('message', async (ctx) => {
  try {
    // const chatId = ctx.chatId;
    const message = ctx.message.text || '';

    if (commands.includes(message)) return;

    const result = await generateText<string>({ prompt: message });

    await ctx.reply(result.data);
  } catch (error) {
    console.log(error);
  }
});
