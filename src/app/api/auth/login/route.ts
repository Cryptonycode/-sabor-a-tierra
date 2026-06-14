import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken, AuthenticatedAdmin } from '@/lib/server/adminAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ADMIN_COOKIE_NAME = 'admin_token';
const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const { email, password } = credentials || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim();
    const { data: adminRow, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, email, role, first_name, last_name, is_active, password_hash')
      .ilike('email', normalizedEmail)
      .eq('is_active', true)
      .single();

    if (adminError || !adminRow || !adminRow.password_hash) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(String(password), adminRow.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!['superadmin', 'admin', 'moderator'].includes(adminRow.role)) {
      return NextResponse.json(
        { success: false, message: 'Usuario sin permisos de administrador' },
        { status: 403 }
      );
    }

    const admin: AuthenticatedAdmin = {
      id: adminRow.id,
      email: adminRow.email,
      role: adminRow.role as AuthenticatedAdmin['role'],
      first_name: adminRow.first_name,
      last_name: adminRow.last_name,
      is_active: adminRow.is_active
    };
    const token = createAdminSessionToken(admin);

    await supabaseAdmin
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const response = NextResponse.json({
      success: true,
      admin,
      token,
      message: 'Login exitoso'
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS
    });

    return response;
  } catch (error) {
    console.error('Error en login admin:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
