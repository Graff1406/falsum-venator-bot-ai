import bot from '@/providers/bot.provider';
import { generateText } from '@/services/generateText.services';
import { Commands, reducePrompt } from '@/utils';
import { WELCOME_MESSAGE_PROMPT } from '@/utils/ai-prompt.util';

// bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }]);

bot.command(Commands.start, async (ctx) => {
  const lang = ctx.from?.language_code;
  const prompt = reducePrompt({
    lang,
    message: WELCOME_MESSAGE_PROMPT,
    payload: 'Response must be included only the translated message.',
  });
  const { data } = await generateText<string>({
    prompt,
  });
  ctx.reply(data);
});
