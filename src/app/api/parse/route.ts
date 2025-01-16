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

    // 먼저 동일한 URL의 데이터가 있는지 확인
    const { data: existingArticle } = await supabase
      .from('articles')
      .select()
      .eq('url', url)
      .single();

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 제목 파싱 개선
    const title = $('.cover_title').text().trim() || 
                 $('.article_title').text().trim() ||
                 $('h1.title').text().trim();

    // 컨텐츠 파싱 개선
    let content = '';
    
    // 본문 내용 파싱
    $('.wrap_body article').find('p, h1, h2, h3, h4, blockquote, figure').each((_, element) => {
      const $element = $(element);
      
      if ($element.find('img').length > 0) {
        const imgSrc = $element.find('img').attr('src');
        if (imgSrc) {
          content += `<figure><img src="${imgSrc}" alt="article image" /></figure>`;
        }
      } else {
        const text = $element.html()?.trim();
        if (text && text.length > 0) {
          content += `<${element.tagName}>${text}</${element.tagName}>`;
        }
      }
    });

    if (!content) {
      content = $('.article_view').html() || 
                $('.wrap_body').html() || 
                '';
    }

    content = content
      .replace(/\n\s+/g, '\n')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();

    if (!title || !content) {
      throw new Error('컨텐츠를 파싱할 수 없습니다.');
    }

    let result;
    let operation;

    if (existingArticle) {
      // 기존 데이터가 있으면 업데이트
      const { data, error } = await supabase
        .from('articles')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('url', url)
        .select();

      result = data;
      operation = 'updated';
      
      if (error) throw error;
    } else {
      // 새로운 데이터 삽입
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

      result = data;
      operation = 'created';
      
      if (error) throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      operation,
      parsedContent: {
        title,
        contentPreview: content.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error('파싱 에러:', error);
    return NextResponse.json({ 
      error: '파싱 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 