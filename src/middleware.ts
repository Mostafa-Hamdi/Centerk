import { NextResponse, type NextRequest } from 'next/server';
import { publicRoutes, routes } from '@/config/routes';
import { REFRESH_COOKIE } from '@/features/auth/constants';

/**
 * Route protection by refresh-cookie presence (the access token lives in memory, so the edge
 * can't see it). Validity is checked client-side by AuthGate via /api/auth/refresh.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isPublic && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === routes.login && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = routes.dashboard;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (icons, robots, sitemap…).
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
