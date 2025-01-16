'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`성공적으로 파싱되었습니다!\n제목: ${result.parsedContent.title}\n미리보기: ${result.parsedContent.contentPreview}`);
        setUrl('');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '파싱 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">관리자 도구</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl mb-2">URL 파싱</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="브런치 URL을 입력하세요"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '파싱 중...' : '파싱하기'}
            </button>
          </form>
          {message && (
            <div className={`mt-4 p-4 rounded ${
              message.includes('성공') ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 