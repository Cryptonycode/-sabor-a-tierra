import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_token';

const getBackendApiUrl = () => {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

const isPublicAdminPath = (pathname: string) => {
  return pathname === '/admin/login' || pathname === '/admin/unauthorized';
};

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const verificationResponse = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    });

    if (!verificationResponse.ok) {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
