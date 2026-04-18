import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';

const ADMIN_COOKIE_NAME = 'admin_token';

export async function POST() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    const supabaseAuth = createSupabaseAuthClient(token);
    await supabaseAuth.auth.signOut();
  }

  const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
