'use client';

import dynamic from 'next/dynamic';

const BookmarksApp = dynamic(() => import('@/components/BookmarksApp'), { ssr: false });

export default function Home() {
  return <BookmarksApp />;
}
