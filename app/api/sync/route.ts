import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (line: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(line)}\n\n`));
      };

      const browser = process.env.FT_BROWSER || 'chrome';
      const proc = spawn('ft', ['sync', '--browser', browser], {
        env: { ...process.env, PATH: `/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:${process.env.PATH}` },
      });

      proc.stdout.on('data', (chunk: Buffer) => {
        chunk.toString().split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed) send(trimmed);
        });
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        chunk.toString().split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed) send(trimmed);
        });
      });

      proc.on('close', (code) => {
        send(code === 0 ? '__done__' : `__error__:exited with code ${code}`);
        controller.close();
      });

      proc.on('error', (err) => {
        send(`__error__:${err.message}`);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
