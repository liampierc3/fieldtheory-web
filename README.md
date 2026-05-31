# fieldtheory-web

A local web UI for browsing and searching your X/Twitter bookmarks, built on top of [fieldtheory](https://github.com/afar1/fieldtheory-cli).

![Three-panel UI with filters, bookmark list, and tweet detail](screenshot.png)

## Features

- Full-text search across all bookmarks
- Filter by category, domain, and author
- Sort by newest or oldest
- Trends view — see which topics you bookmark over time
- Sync bookmarks from the browser without opening a terminal
- Everything runs locally — no data leaves your machine

## Prerequisites

- Node.js 20+
- [fieldtheory](https://github.com/afar1/fieldtheory-cli) installed and synced

```bash
npm install -g fieldtheory
ft sync --browser chrome   # or brave, firefox, edge
```

## Setup

```bash
git clone https://github.com/your-username/fieldtheory-web
cd fieldtheory-web
npm install
cp .env.example .env.local
```

Edit `.env.local` and set your browser:

```
FT_BROWSER=chrome
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supported browsers

`chrome`, `chromium`, `brave`, `edge`, `firefox` — anything supported by fieldtheory's session sync.

## Keeping bookmarks fresh

Use the **sync** button in the bottom-left of the app, or run manually:

```bash
ft sync --browser chrome
```

## Data

All bookmark data lives at `~/.fieldtheory/bookmarks/bookmarks.db` on your machine. This app reads directly from that SQLite database — nothing is sent anywhere.
