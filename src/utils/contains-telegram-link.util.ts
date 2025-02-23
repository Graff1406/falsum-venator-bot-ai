export const containsTelegramLink = (text: string): string | null => {
  const match = text.match(
    /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/[a-zA-Z0-9_\/-]+/i
  );
  return match ? match[0] : null;
};
