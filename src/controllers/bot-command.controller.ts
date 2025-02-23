import bot from '@/providers/bot.provider';
import { Commands } from '@/utils/enums.util';
import { welcomeMessage } from '@/utils/ai-prompt.util';
import { generateText } from '@/services/generateText.services';

// bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }]);

bot.command(Commands.start, async (ctx) => {
  const lang = ctx.from?.language_code;
  const { data } = await generateText<string>({
    prompt: `Translate the message into the specified language:${lang}. message: ${welcomeMessage}. Response must be included only the translated message.`,
  });
  ctx.reply(data);
});
