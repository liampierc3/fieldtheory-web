import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.fieldtheory', 'bookmarks', 'bookmarks.db');

// Twitter Snowflake -> unix ms: (id >> 22) + 1288834974657
const SNOWFLAKE_EPOCH = 1288834974657n;

function getDb() {
  return new Database(DB_PATH, { readonly: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const by = searchParams.get('by') === 'domain' ? 'primary_domain' : 'primary_category';
  const topN = parseInt(searchParams.get('top') || '8');

  const db = getDb();

  try {
    // Get top N categories/domains by total count
    const topItems = db.prepare(`
      SELECT ${by} as name, COUNT(*) as total
      FROM bookmarks
      WHERE ${by} IS NOT NULL
      GROUP BY ${by}
      ORDER BY total DESC
      LIMIT ?
    `).all(topN) as { name: string; total: number }[];

    const topNames = topItems.map(t => t.name);

    // Get all bookmarks with tweet_id and category/domain
    const rows = db.prepare(`
      SELECT tweet_id, ${by} as label
      FROM bookmarks
      WHERE ${by} IS NOT NULL AND tweet_id IS NOT NULL
    `).all() as { tweet_id: string; label: string }[];

    // Derive month from Snowflake ID in JS (avoid SQLite bigint issues)
    const monthCounts: Record<string, Record<string, number>> = {};

    for (const row of rows) {
      if (!topNames.includes(row.label)) continue;
      const id = BigInt(row.tweet_id);
      const ms = Number((id >> 22n) + SNOWFLAKE_EPOCH);
      const d = new Date(ms);
      const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!monthCounts[month]) monthCounts[month] = {};
      monthCounts[month][row.label] = (monthCounts[month][row.label] || 0) + 1;
    }

    // Build sorted month list
    const months = Object.keys(monthCounts).sort();

    return NextResponse.json({ months, data: monthCounts, labels: topNames, totals: topItems });
  } finally {
    db.close();
  }
}
