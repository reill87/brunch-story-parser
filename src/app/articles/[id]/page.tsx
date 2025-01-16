import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ArticlePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-block mb-8 text-blue-500 hover:text-blue-600"
        >
          ← 목록으로 돌아가기
        </Link>
        
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="text-gray-600">
              <div>원본 URL: <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{article.url}</a></div>
              <div>작성일: {new Date(article.created_at).toLocaleDateString()}</div>
              <div>최종 수정일: {new Date(article.updated_at).toLocaleDateString()}</div>
            </div>
          </header>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>
    </div>
  );
} 