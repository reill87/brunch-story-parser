import axios from 'axios';
import * as cheerio from 'cheerio';
import { BrunchArticle } from '@/types';

export async function parseBrunchArticle(url: string): Promise<Partial<BrunchArticle>> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    return {
      title: $('.cover_title').text().trim(),
      content: $('.wrap_body article').html() || '',
      author: $('.author_name').text().trim(),
      url: url
    };
  } catch (error) {
    console.error('파싱 중 에러 발생:', error);
    throw error;
  }
} 