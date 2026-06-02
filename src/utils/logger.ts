import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'auth.log');

export function logAuthEvent(event: 'REGISTER' | 'LOGIN' | 'LOGOUT', email: string, details?: string) {
  const timestamp = new Date().toISOString();
  const detailStr = details ? ` - ${details}` : '';
  const logLine = `[AUTH_LOG][${timestamp}][${event}] Email: ${email}${detailStr}`;

  // 1. Log to console stdout (so it shows up in Vercel/Render function log panels)
  console.log(logLine);

  // 2. Append to a persistent local log file
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logLine + '\n');
  } catch (err) {
    console.error('Failed to write to local log file:', err);
  }
}
