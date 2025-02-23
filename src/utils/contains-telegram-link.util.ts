export const containsTelegramLink = (text: string): boolean =>
  /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/[a-zA-Z0-9_\/-]+/i.test(
    text
  );
