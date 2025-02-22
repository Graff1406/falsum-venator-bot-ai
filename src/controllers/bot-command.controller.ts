import bot from '@/providers/bot.provider';
import { Commands } from '@/utils/enums.util';

// bot.api.setMyCommands([]);

bot.command(Commands.start, (ctx) => {
  console.log('ctx');
  ctx.reply(
    'Welcome to the OpenAI Bot! Please enter a prompt to generate text.'
  );
});
