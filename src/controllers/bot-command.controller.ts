import bot from '@/providers/bot.provider';
import { Commands } from '@/utils/enums.util';

// bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }]);

bot.command(Commands.start, (ctx) => {
  ctx.reply(
    'Welcome to the TelegramAI Bot! Please enter a prompt to generate text.'
  );
});
