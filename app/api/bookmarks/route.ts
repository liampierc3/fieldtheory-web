import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.fieldtheory', 'bookmarks', 'bookmarks.db');

function getDb() {
  return new Database(DB_PATH, { readonly: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const domain = searchParams.get('domain') || '';
  const author = searchParams.get('author') || '';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const type = searchParams.get('type') || 'list';
  const sort = searchParams.get('sort') === 'asc' ? 'ASC' : 'DESC';

  const db = getDb();

  try {
    if (type === 'stats') {
      const total = (db.prepare('SELECT COUNT(*) as c FROM bookmarks').get() as { c: number }).c;
      const categories = db.prepare(
        'SELECT primary_category as name, COUNT(*) as count FROM bookmarks WHERE primary_category IS NOT NULL GROUP BY primary_category ORDER BY count DESC'
      ).all();
      const domains = db.prepare(
        'SELECT primary_domain as name, COUNT(*) as count FROM bookmarks WHERE primary_domain IS NOT NULL GROUP BY primary_domain ORDER BY count DESC'
      ).all();
      const authors = db.prepare(
        'SELECT author_handle as handle, author_name as name, COUNT(*) as count FROM bookmarks WHERE author_handle IS NOT NULL GROUP BY author_handle ORDER BY count DESC LIMIT 50'
      ).all();
      return NextResponse.json({ total, categories, domains, authors });
    }

    let rows;

    if (q) {
      const ftsQuery = db.prepare(`
        SELECT b.* FROM bookmarks b
        JOIN bookmarks_fts ON b.rowid = bookmarks_fts.rowid
        WHERE bookmarks_fts MATCH ?
        ${category ? 'AND b.primary_category = ?' : ''}
        ${domain ? 'AND b.primary_domain = ?' : ''}
        ${author ? 'AND b.author_handle = ?' : ''}
        ORDER BY CAST(b.tweet_id AS INTEGER) ${sort}
        LIMIT ? OFFSET ?
      `);
      const params: (string | number)[] = [q];
      if (category) params.push(category);
      if (domain) params.push(domain);
      if (author) params.push(author);
      params.push(limit, offset);
      rows = ftsQuery.all(...params);
    } else {
      const conditions: string[] = [];
      const params: (string | number)[] = [];
      if (category) { conditions.push('primary_category = ?'); params.push(category); }
      if (domain) { conditions.push('primary_domain = ?'); params.push(domain); }
      if (author) { conditions.push('author_handle = ?'); params.push(author); }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const stmt = db.prepare(`
        SELECT * FROM bookmarks ${where}
        ORDER BY CAST(tweet_id AS INTEGER) ${sort}
        LIMIT ? OFFSET ?
      `);
      rows = stmt.all(...params, limit, offset);
    }

    return NextResponse.json({ bookmarks: rows, offset, limit });
  } finally {
    db.close();
  }
}
