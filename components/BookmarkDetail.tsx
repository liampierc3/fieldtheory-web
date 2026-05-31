'use client';

import { Bookmark } from './BookmarksApp';

interface Props {
  bookmark: Bookmark | null;
  onAuthorClick: (handle: string) => void;
}

function formatDate(str: string) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNum(n: number) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function BookmarkDetail({ bookmark, onAuthorClick }: Props) {
  if (!bookmark) {
    return (
      <div style={{
        width: 360,
        minWidth: 360,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        fontSize: 12,
        background: 'var(--bg-panel)',
      }}>
        select a bookmark
      </div>
    );
  }

  const links = bookmark.links_json ? (() => { try { return JSON.parse(bookmark.links_json); } catch { return []; } })() : [];

  return (
    <div style={{
      width: 360,
      minWidth: 360,
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Author header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {bookmark.author_profile_image_url && (
          <img
            src={bookmark.author_profile_image_url}
            alt=""
            style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {bookmark.author_name || `@${bookmark.author_handle}`}
          </div>
          <button
            onClick={() => onAuthorClick(bookmark.author_handle)}
            style={{
              fontSize: 11,
              color: 'var(--green)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            @{bookmark.author_handle} →
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
          {formatDate(bookmark.posted_at)}
        </div>
      </div>

      {/* Tweet text */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
        lineHeight: 1.65,
        color: 'var(--text)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {bookmark.text}
      </div>

      {/* Stats row */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: 16,
        fontSize: 11,
        color: 'var(--text-dim)',
      }}>
        <span>♥ {formatNum(bookmark.like_count)}</span>
        <span>↺ {formatNum(bookmark.repost_count)}</span>
        <span>↩ {formatNum(bookmark.reply_count)}</span>
        {bookmark.view_count > 0 && <span>◎ {formatNum(bookmark.view_count)}</span>}
      </div>

      {/* Category / Domain tags */}
      {(bookmark.primary_category || bookmark.primary_domain) && (
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          {bookmark.primary_category && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent)',
              borderRadius: 2,
              color: 'var(--text-muted)',
            }}>
              {bookmark.primary_category}
            </span>
          )}
          {bookmark.primary_domain && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent)',
              borderRadius: 2,
              color: 'var(--text-muted)',
            }}>
              {bookmark.primary_domain}
            </span>
          )}
        </div>
      )}

      {/* Article text if enriched */}
      {bookmark.article_title && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>article</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{bookmark.article_title}</div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>links</div>
          {links.map((link: string, i: number) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--green)',
                textDecoration: 'none',
                marginBottom: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {link}
            </a>
          ))}
        </div>
      )}

      {/* Open on X */}
      <div style={{ padding: '12px 16px', marginTop: 'auto' }}>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontSize: 11,
            color: 'var(--text-dim)',
            textDecoration: 'none',
            padding: '5px 10px',
            border: '1px solid var(--border)',
            borderRadius: 3,
            transition: 'border-color 0.1s, color 0.1s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLAnchorElement).style.borderColor = 'var(--green)';
            (e.target as HTMLAnchorElement).style.color = 'var(--green)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLAnchorElement).style.borderColor = 'var(--border)';
            (e.target as HTMLAnchorElement).style.color = 'var(--text-dim)';
          }}
        >
          open on x →
        </a>
      </div>
    </div>
  );
}
