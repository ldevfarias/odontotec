import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    // If verification fails (e.g. expired, bad signature), return null
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPrefixes = ['/dashboard', '/patients', '/professionals', '/settings'];
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isLoginRoute = pathname === '/login';

  // Allow access to public routes (not login, not protected, not onboarding)
  if (!isProtectedRoute && !isOnboardingRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  // No valid access_token — check refresh_token before deciding
  if (!token || !payload) {
    if (!refreshToken) {
      // No tokens at all — public routes are fine, protected routes go to login
      if (isLoginRoute) return NextResponse.next();
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Has refresh_token but no valid access_token (expired or missing).
    // Let the request through — the client-side axios interceptor will
    // transparently refresh the token and retry. Doing isActive checks
    // here without a verified payload would produce false positives.
    // The login page has a client-side guard that handles this case.
    return NextResponse.next();
  }

  // Valid access_token payload available — apply routing rules.

  // Authenticated user trying to reach /login — send to app
  if (isLoginRoute) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  const isActive = payload.isActive === true;

  if (!isActive && isProtectedRoute) {
    // Inactive user (onboarding incomplete) trying to reach the app
    const onboardingUrl = new URL('/onboarding/terms', request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isActive && isOnboardingRoute) {
    // Already active user trying to revisit onboarding — send to app
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect all dashboard routes, onboarding and any other protected routes.
  // /login is included so authenticated users are redirected away from it.
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/patients/:path*',
    '/professionals/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
  ],
};
