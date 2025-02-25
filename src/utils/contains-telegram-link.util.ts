export const getTelegramChannelUsername = (text: string): string | null => {
  const match = text.match(
    /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/(?:[a-zA-Z0-9_-]+\/)?([a-zA-Z0-9_-]+)/i
  );

  if (match) {
    return match[1];
  }

  return null;
};
