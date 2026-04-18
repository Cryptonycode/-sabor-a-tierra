import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const ADMIN_COOKIE_NAME = 'admin_token';

export async function POST(request: Request) {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body || {};

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return NextResponse.json({ success: false, message: 'Sesión inválida' }, { status: 401 });
    }

    const supabaseAuth = createSupabaseAuthClient();
    const { error: oldPasswordError } = await supabaseAuth.auth.signInWithPassword({
      email: userData.user.email,
      password: oldPassword
    });

    if (oldPasswordError) {
      return NextResponse.json(
        { success: false, message: 'Contraseña actual incorrecta' },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'No se pudo actualizar la contraseña' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
