'use client';

import dynamic from 'next/dynamic';

const TrendsView = dynamic(() => import('@/components/TrendsView'), { ssr: false });

export default function TrendsPage() {
  return <TrendsView />;
}
