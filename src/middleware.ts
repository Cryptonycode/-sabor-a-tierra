import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_token';

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
    const verificationUrl = new URL('/api/auth/verify', request.url);
    const verificationResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || ''
      },
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
