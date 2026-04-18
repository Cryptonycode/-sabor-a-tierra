import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ALLOWED_ROLES = ['superadmin', 'admin', 'moderator'] as const;

const mapUserToAdmin = (user: any) => ({
  id: user.id,
  email: user.email,
  first_name: user.user_metadata?.first_name || '',
  last_name: user.user_metadata?.last_name || '',
  role: user.app_metadata?.role || user.user_metadata?.role || 'moderator',
  is_active: user.app_metadata?.is_active ?? true,
  created_at: user.created_at,
  last_sign_in_at: user.last_sign_in_at
});

export async function GET() {
  const authAdmin = await getAuthenticatedAdmin();
  if (!authAdmin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  if (authAdmin.role !== 'superadmin') {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    users: (data.users || []).map(mapUserToAdmin)
  });
}

export async function POST(request: Request) {
  const authAdmin = await getAuthenticatedAdmin();
  if (!authAdmin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  if (authAdmin.role !== 'superadmin') {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, first_name, last_name, role = 'admin', is_active = true } = body || {};

  if (!email || !password || !first_name || !last_name) {
    return NextResponse.json(
      { success: false, message: 'Email, contraseña, nombre y apellido son requeridos' },
      { status: 400 }
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ success: false, message: 'Rol inválido' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name,
      last_name
    },
    app_metadata: {
      role,
      is_active
    }
  });

  if (error || !data.user) {
    return NextResponse.json(
      { success: false, message: error?.message || 'No se pudo crear el usuario' },
      { status: 400 }
    );
  }

  const adminUser = mapUserToAdmin(data.user);
  return NextResponse.json({
    success: true,
    user: adminUser,
    admin: adminUser,
    message: 'Administrador creado exitosamente'
  });
}
