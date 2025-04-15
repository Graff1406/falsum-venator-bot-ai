import { YoutubeTranscript } from 'youtube-transcript';
import getYouTubeID from 'get-youtube-id';

export const analyzeYoutubeContent = async (link: string): Promise<string> => {
  try {
    const id = getYouTubeID(link);
    if (!id) {
      return 'Error: Invalid video link';
    }
    console.log('Analyzing youtube content...');
    const contents = await YoutubeTranscript.fetchTranscript(id) || [];
    const content = contents.map((c) => c.text).join(' ');
    console.log('🚀 ~ analyzeYoutubeContent ~ text:')
    return content;
} catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
}
};