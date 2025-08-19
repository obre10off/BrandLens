import { NextRequest, NextResponse } from 'next/server';
import { auth } from './index';

export async function authMiddleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/projects'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup', '/forgot-password'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Helper to get session in server components
export async function getServerSession() {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

// Helper to require authentication
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
