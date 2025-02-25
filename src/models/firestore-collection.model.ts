import admin from 'firebase-admin';

export interface TelegramChannel {
  id?: string;
  last_message_time?: string;
  last_read_time?: string;
  username: string;
  created_at: admin.firestore.Timestamp;
  followers: { chat_id: number }[];
}
