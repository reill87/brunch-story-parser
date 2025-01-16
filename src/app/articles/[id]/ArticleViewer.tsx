'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
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
      // 모바일과 데스크톱의 여백 차이를 고려한 계산
      const isMobile = window.innerWidth < 640; // sm 브레이크포인트
      const headerHeight = 200; // 헤더 높이
      const paginationHeight = isMobile ? 120 : 50; // 모바일에서는 하단 네비게이션이 더 큼
      const padding = isMobile ? 32 : 64; // 모바일과 데스크톱의 패딩 차이
      const safeArea = isMobile ? 40 : 0; // 모바일 안전 여백

      const availableHeight = window.innerHeight - headerHeight - paginationHeight - padding - safeArea;
      setContentHeight(`${Math.max(400, availableHeight)}px`);
    }

    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    return () => window.removeEventListener('resize', updateContentHeight);
  }, []);

  // 페이지 전환 함수
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(pages.length, p + 1));

  // 스와이프 핸들러 설정
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextPage(),
    onSwipedRight: () => goToPrevPage(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50, // 스와이프로 인식할 최소 거리
    swipeDuration: 500, // 스와이프 지속 시간
  });

  return (
    <div className="min-h-screen sm:p-8">
      <div className="w-full sm:max-w-4xl sm:mx-auto relative">
        <div className="flex justify-between items-center mb-8 p-4 sm:p-0">
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
        
        <article className="bg-white shadow-lg sm:rounded-lg p-4 sm:p-8 min-h-screen sm:min-h-0">
          <header className="mb-8">
            <h1 className={`${FONT_SIZES[fontSize]} font-bold mb-4`}>{initialArticle.title}</h1>
            <div className="text-gray-600">
              <div>원본 URL: <a href={initialArticle.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{initialArticle.url}</a></div>
              <div>작성일: {new Date(initialArticle.created_at).toLocaleDateString()}</div>
              <div>최종 수정일: {new Date(initialArticle.updated_at).toLocaleDateString()}</div>
            </div>
          </header>

          {/* 스와이프 영역 설정 */}
          <div {...swipeHandlers} className="touch-pan-y">
            <div className="relative pb-20 sm:pb-16">
              <div 
                className={`prose max-w-none ${FONT_SIZES[fontSize]}`}
              >
                <div
                  dangerouslySetInnerHTML={{ 
                    __html: pages[currentPage - 1]?.content || initialArticle.content 
                  }}
                />
              </div>
              
              {/* 스와이프 힌트 표시 (첫 방문 시에만 표시) */}
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none sm:hidden">
                {currentPage > 1 && (
                  <div className="text-gray-400 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                )}
                {currentPage < pages.length && (
                  <div className="text-gray-400 animate-pulse ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 hidden sm:flex justify-center py-4 bg-white border-t">
                <div className="text-gray-600">
                  {currentPage} / {pages.length} 페이지
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="fixed bottom-4 left-0 right-0 sm:hidden z-10">
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