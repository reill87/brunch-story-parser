import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url.includes('brunch.co.kr')) {
      return NextResponse.json({ error: '유효한 브런치 URL이 아닙니다.' }, { status: 400 });
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('.cover_title').text().trim();
    const content = $('.wrap_body article').html() || '';

    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          title,
          content,
          url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('파싱 에러:', error);
    return NextResponse.json({ error: '파싱 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 