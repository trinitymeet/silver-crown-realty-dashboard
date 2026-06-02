import { NextResponse } from 'next/server';
import { logAuthEvent } from '../../../../utils/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (email) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
      logAuthEvent('LOGOUT', email, ip);
    }
    return NextResponse.json({ message: 'Session ended successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
