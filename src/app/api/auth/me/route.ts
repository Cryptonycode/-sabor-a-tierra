import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthenticatedAdminFromToken } from '@/lib/server/adminAuth';

const ADMIN_COOKIE_NAME = 'admin_token';

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const admin = await getAuthenticatedAdminFromToken(token);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({ success: true, admin });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
