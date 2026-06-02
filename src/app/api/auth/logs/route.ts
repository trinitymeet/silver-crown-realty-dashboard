import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const IS_PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    const LOG_DIR = IS_PROD ? '/tmp' : path.join(process.cwd(), 'logs');
    const LOG_FILE = path.join(LOG_DIR, 'auth.log');

    if (!fs.existsSync(LOG_FILE)) {
      return new NextResponse('No authentication logs recorded yet.', {
        headers: { 
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0'
        },
      });
    }

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    return new NextResponse(content, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error: any) {
    console.error('Error reading auth logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
