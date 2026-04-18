import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ADMIN_COOKIE_NAME = 'admin_token';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

const resolveAdminFromToken = async (token: string): Promise<AuthenticatedAdmin | null> => {
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
