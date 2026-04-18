import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_token';

export async function POST() {
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
