import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '브런치 리더',
  description: '브런치 글을 책처럼 읽을 수 있는 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link 
                  href="/" 
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  홈
                </Link>
                <Link 
                  href="/admin" 
                  className="flex items-center ml-4 px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  관리자
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
} 