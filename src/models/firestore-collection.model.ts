export interface TelegramChannel {
  id?: string;
  created_at: number;
  link: string;
  followers: { updated_at: number; chat_id: number }[];
}
