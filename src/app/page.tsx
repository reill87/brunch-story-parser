import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0; // 실시간 데이터 반영

async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">브런치 리더</h1>
        <div className="grid gap-6">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/articles/${article.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <article>
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <div className="text-gray-600 text-sm mb-4">
                  작성일: {new Date(article.created_at).toLocaleDateString()}
                </div>
                <div className="text-gray-500 line-clamp-3">
                  {article.content.replace(/<[^>]+>/g, '').substring(0, 200)}...
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 