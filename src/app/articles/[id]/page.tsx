import { supabase } from '@/lib/supabase';
import ArticleViewer from './ArticleViewer';
import { PageProps } from '../../../../.next/types/app/articles/[id]/page';
import { use } from 'react';

export const dynamic = 'force-dynamic';
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
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = await params;
  const article = await getArticle(id);

  if (!article) {
    return null;
  }

  return <ArticleViewer initialArticle={article} />;
} 