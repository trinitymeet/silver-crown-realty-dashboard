import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../../../utils/db';
import { generateTotpSecret, generateOtpauthUrl } from '../../../../../utils/totp';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-create user
      user = await prisma.user.create({
        data: {
          email,
        }
      });
    }

    if (!user.totpEnabled) {
      const secret = generateTotpSecret();
      await prisma.user.update({
        where: { id: user.id },
        data: { totpSecret: secret }
      });
      const otpauthUrl = generateOtpauthUrl(email, secret);
      return NextResponse.json({
        status: 'setup',
        secret,
        otpauthUrl
      });
    } else {
      return NextResponse.json({
        status: 'challenge'
      });
    }
  } catch (error: any) {
    console.error('Initiate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
