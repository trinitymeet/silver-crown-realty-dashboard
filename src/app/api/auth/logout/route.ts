import { NextResponse } from 'next/server';
import { logAuthEvent, getAuthMetadata } from '../../../../utils/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (email) {
      const meta = await getAuthMetadata(request);
      await logAuthEvent('LOGOUT', email, meta);
    }
    return NextResponse.json({ message: 'Session ended successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
