'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface TrendsData {
  months: string[];
  data: Record<string, Record<string, number>>;
  labels: string[];
  totals: { name: string; total: number }[];
}

// Gruvbox-inspired palette
const COLORS = [
  '#7fb02a', // green
  '#d79921', // yellow
  '#458588', // blue
  '#cc241d', // red
  '#b16286', // purple
  '#689d6a', // aqua
  '#d65d0e', // orange
  '#98971a', // olive
];

function formatMonth(m: string) {
  const [year, month] = m.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function TrendsView() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [by, setBy] = useState<'category' | 'domain'>('category');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ x: number; y: number; month: string; values: { label: string; count: number; color: string }[] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(800);

  useEffect(() => {
    setData(null);
    fetch(`/api/trends?by=${by}`)
      .then(r => r.json())
      .then(setData);
  }, [by]);

  useEffect(() => {
    const update = () => {
      if (svgRef.current?.parentElement) {
        setSvgWidth(svgRef.current.parentElement.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [data]);

  const pad = { top: 20, right: 24, bottom: 40, left: 40 };
  const chartH = 320;
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const visibleLabels = data ? data.labels.filter(l => !hidden.has(l)) : [];

  const maxVal = data
    ? Math.max(...data.months.map(m => Math.max(...visibleLabels.map(l => data.data[m]?.[l] || 0))), 1)
    : 1;

  const xScale = (i: number) => {
    if (!data || data.months.length <= 1) return pad.left + plotW / 2;
    return pad.left + (i / (data.months.length - 1)) * plotW;
  };

  const yScale = (v: number) => pad.top + ((maxVal - v) / maxVal) * plotH;

  const buildPath = (label: string) => {
    if (!data) return '';
    const points = data.months
      .map((m, i) => ({ x: xScale(i), y: yScale(data.data[m]?.[label] || 0) }));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!data || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const idx = Math.round(((mouseX - pad.left) / plotW) * (data.months.length - 1));
    const clamped = Math.max(0, Math.min(data.months.length - 1, idx));
    const month = data.months[clamped];
    const values = visibleLabels
      .map((l, i) => ({ label: l, count: data.data[month]?.[l] || 0, color: COLORS[data.labels.indexOf(l) % COLORS.length] }))
      .sort((a, b) => b.count - a.count);
    setTooltip({ x: xScale(clamped), y: e.clientY - rect.top, month, values });
  };

  // X axis label indices
  const xLabelIndices: number[] = [];
  if (data) {
    const step = Math.max(1, Math.floor(data.months.length / 8));
    for (let i = 0; i < data.months.length; i += step) xLabelIndices.push(i);
    if (xLabelIndices[xLabelIndices.length - 1] !== data.months.length - 1) {
      xLabelIndices.push(data.months.length - 1);
    }
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * maxVal));

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '24px 32px', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none' }}>← back</Link>
        <span style={{ color: 'var(--green)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          trends
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['category', 'domain'] as const).map(v => (
            <button
              key={v}
              onClick={() => setBy(v)}
              style={{
                padding: '4px 12px',
                fontSize: 11,
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid',
                borderColor: by === v ? 'var(--green)' : 'var(--border)',
                background: by === v ? 'var(--bg-selected)' : 'var(--bg-card)',
                color: by === v ? 'var(--green)' : 'var(--text-dim)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!data && (
        <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>loading...</div>
      )}

      {data && (
        <>
          {/* Chart */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: '16px 8px 8px', marginBottom: 24, position: 'relative' }}>
            <svg ref={svgRef} width={svgWidth} height={chartH} style={{ display: 'block', overflow: 'visible' }}>
              {/* Grid */}
              <g stroke="#333" strokeWidth={0.5}>
                {yTicks.map(v => (
                  <line key={v} x1={pad.left} y1={yScale(v)} x2={pad.left + plotW} y2={yScale(v)} />
                ))}
              </g>

              {/* Y axis labels */}
              <g fill="#555" fontSize={10} fontFamily="inherit">
                {yTicks.map(v => (
                  <text key={v} x={pad.left - 6} y={yScale(v) + 3} textAnchor="end">{v}</text>
                ))}
              </g>

              {/* X axis labels */}
              <g fill="#555" fontSize={10} fontFamily="inherit">
                {xLabelIndices.map(i => (
                  <text
                    key={i}
                    x={xScale(i)}
                    y={chartH - 6}
                    textAnchor={i === 0 ? 'start' : i === data.months.length - 1 ? 'end' : 'middle'}
                  >
                    {formatMonth(data.months[i])}
                  </text>
                ))}
              </g>

              {/* Lines */}
              {data.labels.map((label, li) => {
                if (hidden.has(label)) return null;
                return (
                  <path
                    key={label}
                    d={buildPath(label)}
                    fill="none"
                    stroke={COLORS[li % COLORS.length]}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={tooltip ? 0.3 : 0.85}
                  />
                );
              })}

              {/* Tooltip vertical line */}
              {tooltip && (
                <line
                  x1={tooltip.x} y1={pad.top}
                  x2={tooltip.x} y2={pad.top + plotH}
                  stroke="#555" strokeWidth={1} strokeDasharray="3,3"
                />
              )}

              {/* Highlight dots at hover */}
              {tooltip && data.labels.map((label, li) => {
                if (hidden.has(label)) return null;
                const monthIdx = data.months.indexOf(tooltip.month);
                const val = data.data[tooltip.month]?.[label] || 0;
                return (
                  <circle
                    key={label}
                    cx={xScale(monthIdx)}
                    cy={yScale(val)}
                    r={3}
                    fill={COLORS[li % COLORS.length]}
                    opacity={val > 0 ? 1 : 0}
                  />
                );
              })}

              {/* Interaction overlay */}
              <rect
                x={pad.left} y={pad.top}
                width={plotW} height={plotH}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
              />
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div style={{
                position: 'absolute',
                left: Math.min(tooltip.x + 12, svgWidth - 160),
                top: 20,
                background: 'var(--bg)',
                border: '1px solid var(--border-accent)',
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 11,
                pointerEvents: 'none',
                minWidth: 140,
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{formatMonth(tooltip.month)}</div>
                {tooltip.values.filter(v => v.count > 0).map(v => (
                  <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: v.color, marginBottom: 2 }}>
                    <span>{v.label}</span>
                    <span>{v.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.labels.map((label, li) => (
              <button
                key={label}
                onClick={() => setHidden(prev => {
                  const next = new Set(prev);
                  next.has(label) ? next.delete(label) : next.add(label);
                  return next;
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  background: hidden.has(label) ? 'transparent' : 'var(--bg-card)',
                  color: hidden.has(label) ? 'var(--text-dim)' : 'var(--text)',
                  opacity: hidden.has(label) ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[li % COLORS.length], flexShrink: 0 }} />
                {label}
                <span style={{ color: 'var(--text-dim)' }}>{data.totals.find(t => t.name === label)?.total}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
