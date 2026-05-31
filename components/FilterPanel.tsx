'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Stats } from './BookmarksApp';

interface Props {
  stats: Stats | null;
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  author: string;
  setAuthor: (v: string) => void;
  sort: 'desc' | 'asc';
  setSort: (v: 'desc' | 'asc') => void;
  onSyncClick: () => void;
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    width: 220,
    minWidth: 220,
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-panel)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 14px 10px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--green)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  searchWrap: {
    padding: '10px 10px 8px',
    borderBottom: '1px solid var(--border)',
  },
  input: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    padding: '5px 8px',
    color: 'var(--text)',
    fontSize: 12,
    fontFamily: 'inherit',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
  },
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '7px 0',
    fontSize: 11,
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--green)' : '2px solid transparent',
    color: active ? 'var(--text)' : 'var(--text-dim)',
    letterSpacing: '0.05em',
    transition: 'all 0.1s',
    marginBottom: -1,
  }),
  scroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0 0 16px',
  },
  section: {
    padding: '10px 14px 4px',
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  item: (active: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 14px',
    cursor: 'pointer',
    fontSize: 12,
    color: active ? 'var(--green)' : 'var(--text-muted)',
    background: active ? 'var(--bg-selected)' : 'transparent',
    borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
    transition: 'all 0.1s',
  }),
  count: {
    fontSize: 10,
    color: 'var(--text-dim)',
  },
  clearBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '6px 14px',
    fontSize: 11,
    color: 'var(--text-dim)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    marginTop: 4,
  },
  sortWrap: {
    padding: '10px 14px 8px',
  },
};

export default function FilterPanel({ stats, query, setQuery, category, setCategory, domain, setDomain, author, setAuthor, sort, setSort, onSyncClick }: Props) {
  const [tab, setTab] = useState<'filters' | 'authors'>('filters');
  const hasFilter = query || category || domain || author;

  return (
    <aside style={s.panel}>
      <div style={{ ...s.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none' }}>
        <span>bookmarks</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onSyncClick} style={{ fontSize: 10, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, letterSpacing: '0.08em' }}>
            sync
          </button>
          <Link href="/trends" style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}>
            trends →
          </Link>
        </div>
      </div>

      <div style={s.searchWrap}>
        <input
          style={s.input}
          placeholder="search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div style={s.tabs}>
        <button style={s.tab(tab === 'filters')} onClick={() => setTab('filters')}>filters</button>
        <button style={s.tab(tab === 'authors')} onClick={() => setTab('authors')}>authors</button>
      </div>

      <div style={s.scroll}>
        {hasFilter && (
          <button style={s.clearBtn} onClick={() => { setQuery(''); setCategory(''); setDomain(''); setAuthor(''); }}>
            ← clear filters
          </button>
        )}

        {tab === 'filters' && (
          <>
            {/* Sort */}
            <div style={s.sortWrap}>
              <div style={{ ...s.section, padding: '0 0 6px' }}>sort</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['desc', 'asc'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setSort(v)}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: 11,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: sort === v ? 'var(--green)' : 'var(--border)',
                      background: sort === v ? 'var(--bg-selected)' : 'var(--bg-card)',
                      color: sort === v ? 'var(--green)' : 'var(--text-dim)',
                      transition: 'all 0.1s',
                    }}
                  >
                    {v === 'desc' ? '↓ newest' : '↑ oldest'}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={s.section}>category</div>
            {stats?.categories.map(c => (
              <div
                key={c.name}
                style={s.item(category === c.name)}
                onClick={() => setCategory(category === c.name ? '' : c.name)}
              >
                <span>{c.name}</span>
                <span style={s.count}>{c.count}</span>
              </div>
            ))}

            {/* Domains */}
            <div style={s.section}>domain</div>
            {stats?.domains.map(d => (
              <div
                key={d.name}
                style={s.item(domain === d.name)}
                onClick={() => setDomain(domain === d.name ? '' : d.name)}
              >
                <span>{d.name}</span>
                <span style={s.count}>{d.count}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'authors' && (
          <>
            <div style={s.section}>top authors</div>
            {stats?.authors.map(a => (
              <div
                key={a.handle}
                style={s.item(author === a.handle)}
                onClick={() => setAuthor(author === a.handle ? '' : a.handle)}
              >
                <span>@{a.handle}</span>
                <span style={s.count}>{a.count}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-dim)' }}>
        {stats ? stats.total.toLocaleString() : '—'} bookmarks
      </div>
    </aside>
  );
}
