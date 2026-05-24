import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/sign-in', '/sign-up'];
const TOKEN_KEY = 'access_token';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const token = request.cookies.get(TOKEN_KEY)?.value;

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
