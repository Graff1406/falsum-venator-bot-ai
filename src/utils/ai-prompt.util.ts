export const WELCOME_MESSAGE_PROMPT = `
Welcome to Falsum Venator Bot AI!

I am your personal disinformation detector on Telegram. My job is to help you spot manipulation, propaganda, and misinformation in messages.

How I work:
- Send me a link to any Telegram channel you want to monitor
- I will analyze all new posts in this channel
- For each message, you will receive a detailed analysis of:
- The level of information reliability
- Detected manipulations
- Type of disinformation
- Hidden motives
- Target audience
- Emotional impact

Get started right now:
Simply send me a link to the Telegram channel you are interested in in the format t.me/channel_name
Remember: the more channels you monitor, the better protected you are from disinformation.
`;

export const CHANNEL_TRACKING_START_PROMPT = `
You need explain that the bot has started monitoring this channel and will analyze new messages for manipulation, fakes, or propaganda.
Also add that the analysis will take time, and the user will be notified when the results are available.
Generate a message that is short, clear, and friendly. Use emoji for better readability, if appropriate.
`;
