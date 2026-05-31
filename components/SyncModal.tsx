'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export default function SyncModal({ onClose, onDone }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const runSync = async () => {
    setLines([]);
    setStatus('running');
    setError('');

    const res = await fetch('/api/sync', { method: 'POST' });
    if (!res.body) { setStatus('error'); setError('No response stream'); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const line = event.replace(/^data: /, '').trim();
        if (!line) continue;
        try {
          const msg = JSON.parse(line) as string;
          if (msg === '__done__') {
            setStatus('done');
            onDone();
          } else if (msg.startsWith('__error__:')) {
            setStatus('error');
            setError(msg.replace('__error__:', ''));
          } else {
            setLines(prev => [...prev, msg]);
          }
        } catch { /* ignore parse errors */ }
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 520,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-accent)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            sync bookmarks
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', padding: 0 }}>×</button>
        </div>

        {/* Log output */}
        <div style={{
          height: 240,
          overflowY: 'auto',
          padding: '12px 16px',
          fontFamily: 'inherit',
          fontSize: 11,
          lineHeight: 1.7,
          color: 'var(--text-muted)',
          background: 'var(--bg)',
        }}>
          {lines.length === 0 && status === 'idle' && (
            <span style={{ color: 'var(--text-dim)' }}>ready. make sure your browser is open and logged into x.com.</span>
          )}
          {lines.map((l, i) => (
            <div key={i} style={{ color: l.startsWith('✓') ? 'var(--green)' : 'var(--text-muted)' }}>{l}</div>
          ))}
          {status === 'done' && <div style={{ color: 'var(--green)', marginTop: 4 }}>✓ sync complete</div>}
          {status === 'error' && <div style={{ color: '#cc241d', marginTop: 4 }}>✗ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          {status !== 'running' && (
            <button
              onClick={runSync}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid var(--green)',
                background: 'var(--bg-selected)',
                color: 'var(--green)',
              }}
            >
              {status === 'done' ? 'sync again' : 'run sync'}
            </button>
          )}
          {status === 'running' && (
            <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', padding: '6px 0' }}>
              syncing...
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: 'pointer',
              borderRadius: 3,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-dim)',
            }}
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}
