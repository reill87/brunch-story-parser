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

    // 제목 파싱 개선
    const title = $('.cover_title').text().trim() || 
                 $('.article_title').text().trim() ||
                 $('h1.title').text().trim();

    // 컨텐츠 파싱 개선
    let content = '';
    
    // 본문 내용 파싱
    $('.wrap_body article').find('p, h1, h2, h3, h4, blockquote, figure').each((_, element) => {
      const $element = $(element);
      
      // 이미지 처리
      if ($element.find('img').length > 0) {
        const imgSrc = $element.find('img').attr('src');
        if (imgSrc) {
          content += `<figure><img src="${imgSrc}" alt="article image" /></figure>`;
        }
      } 
      // 텍스트 컨텐츠 처리
      else {
        const text = $element.html()?.trim();
        if (text && text.length > 0) {
          content += `<${element.tagName}>${text}</${element.tagName}>`;
        }
      }
    });

    // 컨텐츠가 비어있는 경우 대체 선택자 시도
    if (!content) {
      content = $('.article_view').html() || 
                $('.wrap_body').html() || 
                '';
    }

    // HTML 정리
    content = content
      .replace(/\n\s+/g, '\n') // 불필요한 공백 제거
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 스크립트 제거
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // 스타일 제거
      .trim();

    if (!title || !content) {
      throw new Error('컨텐츠를 파싱할 수 없습니다.');
    }

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

    return NextResponse.json({ 
      success: true, 
      data,
      parsedContent: {
        title,
        contentPreview: content.substring(0, 200) + '...' // 미리보기용
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