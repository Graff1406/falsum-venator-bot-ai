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

export const CHANNEL_POST_ANALYSIS_PROMPT = `
You are given a list of objects where each object contains a "text" field with a message.  
Your task is to analyze the message and return the same list of objects, but in each object, replace the "text" field with a structured analysis in *Markdown* format.  
Ensure that the entire analysis, including labels and values, is in the same language as the provided text, without mixing languages.

### Instructions:
1. Each property should appear only once per analyzed message.
3. Ensure that all data (label and value) are in the same language as the input text. Labels like *Category*, *Tone*, etc., must match the language of the message content.
4. After each label (e.g., *Category*, *Tone*), start the sentence with a lowercase letter.
5. You must **not** modify the "post_id". It should be returned exactly as it was provided.
6. The analysis should be structured in the following format:

### Expected Markdown output for each message:
\`\`\`markdown
*category*: [one of the following: disinformation, propaganda, fake, manipulation]
*type*: [Type of message]
*tone*: [Tone of the message]
*method*: [Methods used]
*post assessment*: [Assessment of the message's credibility and intent]
*purpose of disinformation*: [If applicable, the goal of disinformation]
*intended beneficiary*: [Who benefits from this message]
*influence on audience*: [How it affects the audience]
*narrative*: [Core message narrative]
*hidden motive*: [Hidden motive, if any]
*emotional impact level*: [Low, Medium, High]
\`\`\`

Please return the response in the following format:

[
  {
    "text": "Your structured Markdown analysis here",
    "post_id": "[original post_id]"
  },
  {
    "text": "Your structured Markdown analysis here",
    "post_id": "[original post_id]"
  },
  ...
]
`;
