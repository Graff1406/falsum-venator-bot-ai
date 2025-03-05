import axios from 'axios';
import * as cheerio from 'cheerio';
import { TelegramChannelPost } from '@/models';

interface Props {
  url: string;
  countPosts?: number;
  fromDatetime?: string;
}

export const parseTelegramChannelPosts = async ({
  url,
  countPosts = 0,
  fromDatetime,
}: Props): Promise<TelegramChannelPost[]> => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Get the channel name (author)
    const author =
      $('.tgme_channel_info_header_title > span').text().trim() || 'Unknown';

    const posts: TelegramChannelPost[] = [];

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
        posts.push({ post_id, text, datetime, author });
      }
    });

    if (!posts.length) return [];

    let filteredPosts = posts
      .slice(-countPosts)
      .filter((post) => post.text.length > 200);

    // Filter by date if `fromDatetime` is provided
    if (fromDatetime) {
      filteredPosts = posts.filter((post) => {
        if (!post.datetime || !post.text) return false;

        const postDatetime = new Date(post.datetime).getTime();
        const incomeDatetime = new Date(fromDatetime).getTime();
        return postDatetime > incomeDatetime;
      });
    }

    return filteredPosts;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};
