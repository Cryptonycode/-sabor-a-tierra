import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';
import { getAuthenticatedAdminFromToken } from '@/lib/server/adminAuth';

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

    const supabaseAuth = createSupabaseAuthClient();
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error || !data.session?.access_token) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const admin = await getAuthenticatedAdminFromToken(data.session.access_token);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Usuario sin permisos de administrador' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      admin,
      token: data.session.access_token,
      message: 'Login exitoso'
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: data.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
