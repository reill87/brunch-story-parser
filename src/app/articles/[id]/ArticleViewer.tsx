'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { splitContentIntoPages } from '@/utils/pageCalculator';
import { BrunchArticle } from '@/types';

interface ArticleViewerProps {
  initialArticle: BrunchArticle;
}

const FONT_SIZES = {
  small: 'text-base',
  medium: 'text-lg',
  large: 'text-xl',
  xlarge: 'text-2xl'
};

type FontSizeKey = keyof typeof FONT_SIZES;

export default function ArticleViewer({ initialArticle }: ArticleViewerProps) {
  const [pages, setPages] = useState<Array<{ content: string; pageNumber: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState<FontSizeKey>('medium');
  const [contentHeight, setContentHeight] = useState('700px');

  // 페이지 분할 함수
  const calculatePages = () => {
    if (typeof window !== 'undefined') {
      const splitPages = splitContentIntoPages(initialArticle.content, fontSize);
      setPages(splitPages);
      // 페이지를 다시 계산할 때 현재 페이지가 전체 페이지 수를 넘지 않도록 조정
      setCurrentPage(curr => Math.min(curr, splitPages.length));
    }
  };

  // 초기 페이지 계산 및 폰트 크기 변경 시 재계산
  useEffect(() => {
    calculatePages();
  }, [initialArticle.content, fontSize]);

  // 키보드 네비게이션
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(pages.length, p + 1));
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pages.length]);

  useEffect(() => {
    function updateContentHeight() {
      // 헤더와 페이지 표시기의 높이를 제외한 나머지 공간 계산
      const headerHeight = 200; // 대략적인 헤더 높이
      const paginationHeight = 50; // 페이지 표시기 높이
      const padding = 64; // p-8의 padding 값 (8 * 8px)
      const availableHeight = window.innerHeight - headerHeight - paginationHeight - padding;
      setContentHeight(`${Math.max(400, availableHeight)}px`);
    }

    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    return () => window.removeEventListener('resize', updateContentHeight);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="inline-block text-blue-500 hover:text-blue-600"
          >
            ← 목록으로 돌아가기
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">글자 크기:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSizeKey)}
              className="p-2 border rounded"
            >
              <option value="small">작게</option>
              <option value="medium">보통</option>
              <option value="large">크게</option>
              <option value="xlarge">아주 크게</option>
            </select>
          </div>
        </div>
        
        <article className="bg-white shadow-lg rounded-lg p-8">
          <header className="mb-8">
            <h1 className={`${FONT_SIZES[fontSize]} font-bold mb-4`}>{initialArticle.title}</h1>
            <div className="text-gray-600">
              <div>원본 URL: <a href={initialArticle.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{initialArticle.url}</a></div>
              <div>작성일: {new Date(initialArticle.created_at).toLocaleDateString()}</div>
              <div>최종 수정일: {new Date(initialArticle.updated_at).toLocaleDateString()}</div>
            </div>
          </header>

          <div className="relative" style={{ minHeight: contentHeight }}>
            <div 
              className={`prose max-w-none ${FONT_SIZES[fontSize]}`}
              style={{ height: contentHeight }}
            >
              <div
                className="h-full"
                dangerouslySetInnerHTML={{ 
                  __html: pages[currentPage - 1]?.content || initialArticle.content 
                }}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 hidden sm:flex justify-center py-4 bg-white border-t">
              <div className="text-gray-600">
                {currentPage} / {pages.length} 페이지
              </div>
            </div>
          </div>
        </article>

        <div className="fixed bottom-4 left-0 right-0 sm:hidden">
          <div className="flex justify-center mb-2">
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-gray-600">
              {currentPage} / {pages.length} 페이지
            </div>
          </div>
          
          <div className="flex justify-between px-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white/90 text-blue-500 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="이전 페이지"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))}
              disabled={currentPage === pages.length}
              className="p-3 bg-white/90 text-blue-500 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="다음 페이지"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden sm:block">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 px-4 py-8 bg-white/80 hover:bg-white text-blue-500 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="이전 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))}
            disabled={currentPage === pages.length}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 px-4 py-8 bg-white/80 hover:bg-white text-blue-500 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="다음 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 