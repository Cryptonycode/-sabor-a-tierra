import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ALLOWED_ROLES = ['superadmin', 'admin', 'moderator'] as const;

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authAdmin = await getAuthenticatedAdmin();
  if (!authAdmin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  if (authAdmin.role !== 'superadmin') {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  const { email, first_name, last_name, role, is_active, password } = body || {};

  if (role && !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ success: false, message: 'Rol inválido' }, { status: 400 });
  }

  const userAttributes: Record<string, unknown> = {};
  const userMetadata: Record<string, unknown> = {};
  const appMetadata: Record<string, unknown> = {};

  if (email) userAttributes.email = email;
  if (password) userAttributes.password = password;
  if (first_name !== undefined) userMetadata.first_name = first_name;
  if (last_name !== undefined) userMetadata.last_name = last_name;
  if (role !== undefined) appMetadata.role = role;
  if (is_active !== undefined) appMetadata.is_active = Boolean(is_active);

  if (Object.keys(userMetadata).length > 0) {
    userAttributes.user_metadata = userMetadata;
  }
  if (Object.keys(appMetadata).length > 0) {
    userAttributes.app_metadata = appMetadata;
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(params.id, userAttributes);
  if (error || !data.user) {
    return NextResponse.json(
      { success: false, message: error?.message || 'No se pudo actualizar el usuario' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      first_name: data.user.user_metadata?.first_name || '',
      last_name: data.user.user_metadata?.last_name || '',
      role: data.user.app_metadata?.role || data.user.user_metadata?.role || 'moderator',
      is_active: data.user.app_metadata?.is_active ?? true
    }
  });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const authAdmin = await getAuthenticatedAdmin();
  if (!authAdmin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  if (authAdmin.role !== 'superadmin') {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Usuario eliminado' });
}
