import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../utils/db';
import { verifyTotp } from '../../../../../utils/totp';
import { logAuthEvent, getAuthMetadata } from '../../../../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: 'Email and 6-digit code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ error: 'Authentication setup not initiated' }, { status: 404 });
    }

    const isValid = verifyTotp(code, user.totpSecret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authenticator code' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: true,
        loginCount: 1
      }
    });

    const meta = await getAuthMetadata(request);
    await logAuthEvent('REGISTER', email, meta);
    await logAuthEvent('LOGIN', email, { ...meta, details: '(Total logins: 1)' });

    const token = jwt.sign({ userId: updatedUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return NextResponse.json({
      token,
      userId: updatedUser.id,
      username: email.split('@')[0],
      email: updatedUser.email
    });
  } catch (error: any) {
    console.error('Verify Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
