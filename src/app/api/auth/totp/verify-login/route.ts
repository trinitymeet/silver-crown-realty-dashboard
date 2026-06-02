import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../utils/db';
import { verifyTotp } from '../../../../../utils/totp';
import { logAuthEvent } from '../../../../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: 'Email and 6-digit code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json({ error: 'Smartcode authentication not configured for this user' }, { status: 400 });
    }

    const isValid = verifyTotp(code, user.totpSecret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authenticator code' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: {
          increment: 1
        }
      }
    });

    logAuthEvent('LOGIN', email, `(Total logins: ${updatedUser.loginCount})`);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return NextResponse.json({
      token,
      userId: user.id,
      username: email.split('@')[0],
      email: user.email
    });
  } catch (error: any) {
    console.error('Verify Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
