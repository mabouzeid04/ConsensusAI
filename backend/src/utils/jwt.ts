import { sign as jwtSign, verify as jwtVerify, Secret, JwtPayload, SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export function signAuthToken(payload: AuthTokenPayload, expiresInSeconds: number = 7 * 24 * 60 * 60): string {
  const opts: SignOptions = { expiresIn: expiresInSeconds };
  return jwtSign(payload, JWT_SECRET as Secret, opts);
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwtVerify(token, JWT_SECRET as Secret) as JwtPayload | string;
    if (typeof decoded === 'string') return null;
    return { userId: String(decoded.userId), email: String(decoded.email) };
  } catch {
    return null;
  }
}

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  return {
    httpOnly: true as const,
    sameSite: ('lax' as const),
    secure: isProd,
    domain,
    // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}


