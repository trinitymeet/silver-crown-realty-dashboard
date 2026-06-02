import fs from 'fs';
import path from 'path';
import { userAgent } from 'next/server';

const IS_PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const LOG_DIR = IS_PROD ? '/tmp' : path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'auth.log');

interface LogDetails {
  ip: string;
  location?: string;
  device?: string;
  browser?: string;
  isp?: string;
  details?: string;
}

export async function getAuthMetadata(request: Request) {
  // 1. IP Address
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // 2. Location (Vercel specific headers)
  const city = request.headers.get('x-vercel-ip-city') || '';
  const region = request.headers.get('x-vercel-ip-country-region') || '';
  const country = request.headers.get('x-vercel-ip-country') || '';
  
  let location = 'Localhost/Unknown';
  if (city || region || country) {
    location = `${city}${city && region ? ', ' : ''}${region}${region && country ? ', ' : ''}${country}`;
  }

  // 3. Device & Browser (Next.js User Agent)
  const ua = userAgent({ headers: request.headers });
  const deviceType = ua.device.type || 'PC';
  const osName = ua.os.name || 'Unknown OS';
  const osVersion = ua.os.version || '';
  const browserName = ua.browser.name || 'Unknown Browser';
  const browserVersion = ua.browser.version || '';

  const device = `${deviceType} (${osName}${osVersion ? ' ' + osVersion : ''})`;
  const browser = `${browserName}${browserVersion ? ' ' + browserVersion : ''}`;

  // 4. ISP lookup (Background API call)
  let isp = 'Local Network';
  if (ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s limit
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=isp`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        isp = data.isp || 'Unknown ISP';
      }
    } catch (e) {
      console.error('ISP lookup failed:', e);
      isp = 'Lookup Failed';
    }
  }

  return { ip, location, device, browser, isp };
}

export async function logAuthEvent(
  event: 'REGISTER' | 'LOGIN' | 'LOGOUT',
  email: string,
  meta: LogDetails
) {
  const timestamp = new Date().toISOString();
  
  const locStr = meta.location ? ` - Location: ${meta.location}` : '';
  const ispStr = meta.isp ? ` - ISP: ${meta.isp}` : '';
  const devStr = meta.device ? ` - Device: ${meta.device}` : '';
  const browserStr = meta.browser ? ` - Browser: ${meta.browser}` : '';
  const detailStr = meta.details ? ` - ${meta.details}` : '';
  
  const logLine = `[AUTH_LOG][${timestamp}][${event}] Email: ${email} - IP: ${meta.ip}${locStr}${ispStr}${devStr}${browserStr}${detailStr}`;

  // 1. Log to console stdout
  console.log(logLine);

  // 2. Append to log file
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logLine + '\n');
  } catch (err) {
    console.error('Failed to write to local log file:', err);
  }
}
