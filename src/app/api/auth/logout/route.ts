import { NextResponse } from 'next/server';
import { logAuthEvent } from '../../../../utils/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (email) {
      logAuthEvent('LOGOUT', email);
    }
    return NextResponse.json({ message: 'Session ended successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
