import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_token';
const ONE_DAY_SECONDS = 60 * 60 * 24;

const getBackendApiUrl = () => {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

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

    const backendResponse = await fetch(`${getBackendApiUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok || !data?.success || !data?.token) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || 'Credenciales inválidas'
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      admin: data.admin,
      token: data.token,
      message: data.message || 'Login exitoso'
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: data.token,
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
