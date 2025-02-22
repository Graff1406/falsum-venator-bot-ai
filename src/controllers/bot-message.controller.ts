import bot from '../providers/bot.provider';
import { generateText } from '../services/generateText.services';

bot.on('message', async (ctx) => {
  try {
    const message = ctx.message.text || '';
    const result = await generateText<string>({ prompt: message });

    await ctx.reply(result.data, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.log(error);
  }
});
