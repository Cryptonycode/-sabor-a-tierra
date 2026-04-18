import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_token';

const getBackendApiUrl = () => {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export async function POST() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const backendResponse = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok || !data?.success) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    return NextResponse.json({ success: true, admin: data.admin });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
