'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { splitContentIntoPages } from '@/utils/pageCalculator';
import { BrunchArticle } from '@/types';

interface ArticleViewerProps {
  initialArticle: BrunchArticle;
}

export default function ArticleViewer({ initialArticle }: ArticleViewerProps) {
  const [pages, setPages] = useState<Array<{ content: string; pageNumber: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const splitPages = splitContentIntoPages(initialArticle.content);
      setPages(splitPages);
    }
  }, [initialArticle.content]);

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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-block mb-8 text-blue-500 hover:text-blue-600"
        >
          ← 목록으로 돌아가기
        </Link>
        
        <article className="bg-white shadow-lg rounded-lg p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{initialArticle.title}</h1>
            <div className="text-gray-600">
              <div>원본 URL: <a href={initialArticle.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{initialArticle.url}</a></div>
              <div>작성일: {new Date(initialArticle.created_at).toLocaleDateString()}</div>
              <div>최종 수정일: {new Date(initialArticle.updated_at).toLocaleDateString()}</div>
            </div>
          </header>

          <div className="relative min-h-[800px]">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: pages[currentPage - 1]?.content || '' }}
            />
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center py-4 bg-white border-t">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                이전 페이지
              </button>
              
              <div className="text-gray-600">
                {currentPage} / {pages.length} 페이지
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))}
                disabled={currentPage === pages.length}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                다음 페이지
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
} 