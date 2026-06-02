import crypto from 'crypto';

// Base32 alphabet for TOTP secrets
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encodes a buffer into a Base32 string.
 */
export function encodeBase32(buffer: Buffer): string {
  let bits = '';
  for (let i = 0; i < buffer.length; i++) {
    bits += buffer[i].toString(2).padStart(8, '0');
  }
  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5).padEnd(5, '0');
    base32 += ALPHABET[parseInt(chunk, 2)];
  }
  return base32;
}

/**
 * Decodes a Base32 string into a buffer.
 */
export function decodeBase32(base32: string): Buffer {
  const clean = base32.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = ALPHABET.indexOf(clean[i]);
    if (val === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generates a random Base32 TOTP secret (10 bytes = 80 bits, which encodes to 16 Base32 chars).
 */
export function generateTotpSecret(): string {
  const bytes = crypto.randomBytes(10);
  return encodeBase32(bytes);
}

/**
 * Generates the HOTP value for a given key and counter.
 */
export function calculateHotp(key: Buffer, counter: number): string {
  // Convert counter to an 8-byte big-endian buffer
  const buf = Buffer.alloc(8);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;
  buf.writeUInt32BE(high, 0);
  buf.writeUInt32BE(low, 4);

  // Compute HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifies a TOTP code against a Base32 secret with allowed clock drift window.
 * @param code The 6-digit TOTP code to verify
 * @param secretBase32 The Base32 encoded secret key
 * @param windowSteps Number of 30-second steps to check in past and future (default 1)
 */
export function verifyTotp(code: string, secretBase32: string, windowSteps = 1): boolean {
  try {
    const key = decodeBase32(secretBase32);
    // Current time step (30 seconds)
    const currentCounter = Math.floor(Date.now() / 1000 / 30);
    
    // Check current step and neighboring steps
    for (let i = -windowSteps; i <= windowSteps; i++) {
      const calculated = calculateHotp(key, currentCounter + i);
      if (calculated === code.trim()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generates an otpauth:// URL for setting up Google Authenticator.
 */
export function generateOtpauthUrl(email: string, secretBase32: string): string {
  const issuer = encodeURIComponent('SilverCrownRealty');
  const label = encodeURIComponent(email);
  return `otpauth://totp/${issuer}:${label}?secret=${secretBase32}&issuer=${issuer}`;
}
