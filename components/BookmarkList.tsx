'use client';

import { useEffect, useRef } from 'react';
import { Bookmark } from './BookmarksApp';

interface Props {
  bookmarks: Bookmark[];
  selected: Bookmark | null;
  setSelected: (b: Bookmark) => void;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

function formatDate(str: string) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(text: string, len = 120) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}

export default function BookmarkList({ bookmarks, selected, setSelected, loading, hasMore, loadMore }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { threshold: 0.1 });
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto',
      background: 'var(--bg)',
    }}>
      {bookmarks.length === 0 && !loading && (
        <div style={{ padding: 24, color: 'var(--text-dim)', fontSize: 12 }}>no bookmarks found</div>
      )}

      {bookmarks.map((b, i) => {
        const isSelected = selected?.id === b.id;
        return (
          <div
            key={`${b.id}-${i}`}
            onClick={() => setSelected(b)}
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: isSelected ? 'var(--bg-selected)' : 'transparent',
              borderLeft: isSelected ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'; }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              {b.author_profile_image_url && (
                <img
                  src={b.author_profile_image_url}
                  alt=""
                  style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>
                @{b.author_handle}
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 'auto' }}>
                {formatDate(b.posted_at)}
              </span>
            </div>

            {/* Tweet text */}
            <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>
              {truncate(b.text)}
            </div>

            {/* Tags */}
            {(b.primary_category || b.primary_domain) && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {b.primary_category && (
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    color: 'var(--text-dim)',
                  }}>
                    {b.primary_category}
                  </span>
                )}
                {b.primary_domain && b.primary_domain !== b.primary_category && (
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    color: 'var(--text-dim)',
                  }}>
                    {b.primary_domain}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div ref={bottomRef} style={{ height: 1 }} />

      {loading && (
        <div style={{ padding: 16, color: 'var(--text-dim)', fontSize: 11, textAlign: 'center' }}>
          loading...
        </div>
      )}
    </div>
  );
}
