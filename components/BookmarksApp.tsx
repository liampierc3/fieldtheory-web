'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FilterPanel from './FilterPanel';
import BookmarkList from './BookmarkList';
import BookmarkDetail from './BookmarkDetail';
import SyncModal from './SyncModal';

export interface Bookmark {
  id: string;
  tweet_id: string;
  url: string;
  text: string;
  author_handle: string;
  author_name: string;
  author_profile_image_url: string;
  posted_at: string;
  bookmarked_at: string;
  primary_category: string;
  primary_domain: string;
  like_count: number;
  repost_count: number;
  reply_count: number;
  view_count: number;
  media_count: number;
  links_json: string;
  quoted_tweet_json: string;
  article_title: string;
  article_text: string;
}

export interface Stats {
  total: number;
  categories: { name: string; count: number }[];
  domains: { name: string; count: number }[];
  authors: { handle: string; name: string; count: number }[];
}

export default function BookmarksApp() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<Bookmark | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [domain, setDomain] = useState('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [showSync, setShowSync] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const LIMIT = 50;

  useEffect(() => {
    fetch('/api/bookmarks?type=stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  const fetchBookmarks = useCallback(async (reset: boolean) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const newOffset = reset ? 0 : offset;
    setLoading(true);

    const params = new URLSearchParams({
      limit: String(LIMIT),
      offset: String(newOffset),
      sort,
      ...(query && { q: query }),
      ...(category && { category }),
      ...(domain && { domain }),
      ...(author && { author }),
    });

    try {
      const res = await fetch(`/api/bookmarks?${params}`, { signal: controller.signal });
      const data = await res.json();
      setBookmarks(prev => reset ? data.bookmarks : [...prev, ...data.bookmarks]);
      setHasMore(data.bookmarks.length === LIMIT);
      if (reset) setOffset(LIMIT);
      else setOffset(newOffset + LIMIT);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, category, domain, author, sort, offset]);

  useEffect(() => {
    fetchBookmarks(true);
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, domain, author, sort]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <FilterPanel
        stats={stats}
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        domain={domain}
        setDomain={setDomain}
        author={author}
        setAuthor={setAuthor}
        sort={sort}
        setSort={setSort}
        onSyncClick={() => setShowSync(true)}
      />
      {showSync && (
        <SyncModal
          onClose={() => setShowSync(false)}
          onDone={() => {
            setShowSync(false);
            fetch('/api/bookmarks?type=stats').then(r => r.json()).then(setStats);
            fetchBookmarks(true);
          }}
        />
      )}
      <BookmarkList
        bookmarks={bookmarks}
        selected={selected}
        setSelected={setSelected}
        loading={loading}
        hasMore={hasMore}
        loadMore={() => fetchBookmarks(false)}
      />
      <BookmarkDetail bookmark={selected} onAuthorClick={(handle) => {
        setAuthor(handle);
        setCategory('');
        setDomain('');
        setQuery('');
      }} />
    </div>
  );
}
