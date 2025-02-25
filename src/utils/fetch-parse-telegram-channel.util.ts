import axios from 'axios';
import * as cheerio from 'cheerio';
import { ChannelPostData } from '@/models';

export const parseTelegramChannelPosts = async (
  url: string
): Promise<ChannelPostData[] | null> => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const messages: ChannelPostData[] = [];

    $('.tgme_widget_message').each((_, element) => {
      if ($(element).hasClass('service_message')) return;

      const post_id_raw = $(element).attr('data-post') || '';
      const post_id_match = post_id_raw.match(/\/(\d+)$/);

      const post_id = post_id_match ? post_id_match[1] : '';

      const text = $(element).find('.tgme_widget_message_text').text().trim();
      const datetime =
        $(element).find('.tgme_widget_message_date time').attr('datetime') ||
        '';

      if (text && datetime && post_id) {
        messages.push({ post_id, text, datetime });
      }
    });

    return messages.length ? messages : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
