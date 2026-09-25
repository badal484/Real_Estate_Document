import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient, type User } from '@prisma/client';
import { createError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const SESSION_TTL = '7d';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  pictureUrl: string | null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw createError(`${name} is not configured on the server`, 500);
  return value;
}

let googleClient: OAuth2Client | null = null;
function getGoogleClient(): OAuth2Client {
  googleClient ??= new OAuth2Client(requireEnv('GOOGLE_CLIENT_ID'), process.env['GOOGLE_CLIENT_SECRET']);
  return googleClient;
}

function toSessionUser(user: User): SessionUser {
  return { id: user.id, email: user.email, name: user.name, pictureUrl: user.pictureUrl };
}

/** Verify a Google Identity Services ID token and upsert the matching user. */
export async function signInWithGoogle(credential: string): Promise<{ token: string; user: SessionUser }> {
  const ticket = await getGoogleClient()
    .verifyIdToken({ idToken: credential, audience: requireEnv('GOOGLE_CLIENT_ID') })
    .catch(() => {
      throw createError('Invalid Google credential', 401);
    });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw createError('Google account email is not verified', 401);
  }

  const profile = {
    email: payload.email,
    name: payload.name ?? null,
    pictureUrl: payload.picture ?? null,
    lastLoginAt: new Date(),
  };
  const user = await prisma.user.upsert({
    where: { googleId: payload.sub },
    update: profile,
    create: { googleId: payload.sub, ...profile },
  });

  const sessionUser = toSessionUser(user);
  const token = jwt.sign(sessionUser, requireEnv('JWT_SECRET'), {
    subject: user.id,
    expiresIn: SESSION_TTL,
  });
  return { token, user: sessionUser };
}

/** Decode and verify a session JWT issued by signInWithGoogle. */
export function verifySessionToken(token: string): SessionUser {
  try {
    const decoded = jwt.verify(token, requireEnv('JWT_SECRET')) as jwt.JwtPayload & SessionUser;
    return { id: decoded.id, email: decoded.email, name: decoded.name, pictureUrl: decoded.pictureUrl };
  } catch {
    throw createError('Session expired or invalid — please sign in again', 401);
  }
}
