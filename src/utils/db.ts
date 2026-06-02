import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Serverless environment: SQLite must use /tmp to be writeable.
  const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const destDbPath = '/tmp/dev.db';

  try {
    if (!fs.existsSync(destDbPath)) {
      console.log(`[DB_INIT] Copying template SQLite database from ${srcDbPath} to ${destDbPath}`);
      fs.mkdirSync(path.dirname(destDbPath), { recursive: true });
      if (fs.existsSync(srcDbPath)) {
        fs.copyFileSync(srcDbPath, destDbPath);
        fs.chmodSync(destDbPath, 0o666);
      } else {
        console.warn(`[DB_INIT] Warning: Source database template not found at ${srcDbPath}`);
      }
    }
  } catch (error) {
    console.error('[DB_INIT] Failed to initialize SQLite database in /tmp:', error);
  }

  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: `file:${destDbPath}`,
      },
    },
    log: ['error'],
  });
} else {
  // Local development (Windows/macOS)
  prismaClient = new PrismaClient({
    log: ['error'],
  });
}

export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
