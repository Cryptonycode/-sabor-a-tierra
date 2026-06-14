import { cookies } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_SESSION_PREFIX = 'admin';
const ONE_DAY_SECONDS = 60 * 60 * 24;

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

const getSessionSecret = () =>
  process.env.ADMIN_JWT_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXTAUTH_SECRET;

const signPayload = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export const createAdminSessionToken = (admin: AuthenticatedAdmin): string => {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Falta una clave secreta para firmar la sesión de administrador');
  }

  const payload = Buffer.from(JSON.stringify({
    id: admin.id,
    email: admin.email,
    role: admin.role,
    exp: Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS
  })).toString('base64url');
  const signature = signPayload(payload, secret);

  return `${ADMIN_SESSION_PREFIX}.${payload}.${signature}`;
};

const resolveAdminFromSessionToken = async (token: string): Promise<AuthenticatedAdmin | null> => {
  const secret = getSessionSecret();
  if (!secret || !token.startsWith(`${ADMIN_SESSION_PREFIX}.`)) {
    return null;
  }

  const [, payload, signature] = token.split('.');
  if (!payload || !signature || signature !== signPayload(payload, secret)) {
    return null;
  }

  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
    id?: string;
    exp?: number;
  };

  if (!session.id || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id, email, role, first_name, last_name, is_active')
    .eq('id', session.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminRow || !['superadmin', 'admin', 'moderator'].includes(adminRow.role)) {
    return null;
  }

  return {
    id: adminRow.id,
    email: adminRow.email,
    role: adminRow.role as AuthenticatedAdmin['role'],
    first_name: adminRow.first_name,
    last_name: adminRow.last_name,
    is_active: adminRow.is_active
  };
};

const resolveAdminFromToken = async (token: string): Promise<AuthenticatedAdmin | null> => {
  const sessionAdmin = await resolveAdminFromSessionToken(token);
  if (sessionAdmin) {
    return sessionAdmin;
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return null;
  }

  const user = userData.user;
  const metaRole = user.app_metadata?.role || user.user_metadata?.role;
  if (metaRole && ['superadmin', 'admin', 'moderator'].includes(metaRole)) {
    return {
      id: user.id,
      email: user.email || '',
      role: metaRole as AuthenticatedAdmin['role'],
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name,
      is_active: true
    };
  }

  // Fallback de compatibilidad mientras exista la tabla admins legacy.
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id, email, role, first_name, last_name, is_active')
    .eq('email', user.email)
    .eq('is_active', true)
    .single();

  if (adminError || !adminRow) {
    return null;
  }

  if (!['superadmin', 'admin', 'moderator'].includes(adminRow.role)) {
    return null;
  }

  return {
    id: adminRow.id,
    email: adminRow.email,
    role: adminRow.role,
    first_name: adminRow.first_name,
    last_name: adminRow.last_name,
    is_active: adminRow.is_active
  };
};

export const getAuthenticatedAdminFromToken = async (token: string): Promise<AuthenticatedAdmin | null> => {
  if (!token) return null;
  try {
    return await resolveAdminFromToken(token);
  } catch {
    return null;
  }
};

export const getAuthenticatedAdmin = async (): Promise<AuthenticatedAdmin | null> => {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return await resolveAdminFromToken(token);
  } catch {
    return null;
  }
};
