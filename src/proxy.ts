import { NextResponse, type NextRequest } from 'next/server';
import {
  defaultLocale,
  getLocalePath,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  supportedLocales
} from './i18n/locale';

// Routes to bypass from i18n URL rewriting
const IGNORED_PATHS = ['/api', '/trpc', '/monitoring', '/auth'];

function isProtectedPath(path: string) {
  let clean = path;
  for (const loc of supportedLocales) {
    if (clean === `/${loc}` || clean.startsWith(`/${loc}/`)) {
      clean = clean.slice(`/${loc}`.length) || '/';
      break;
    }
  }
  return clean === '/' || clean.startsWith('/dashboard') || clean === '/overview';
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check authentication for protected routes (/, /overview, /dashboard/*)
  if (isProtectedPath(pathname)) {
    const sessionToken =
      req.cookies.get('better-auth.session_token')?.value ||
      req.cookies.get('__Secure-better-auth.session_token')?.value;

    if (!sessionToken) {
      const signInUrl = req.nextUrl.clone();
      const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
      const resolvedLocale = normalizeLocale(cookieLocale || defaultLocale);
      signInUrl.pathname = getLocalePath('/sign-in', resolvedLocale);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Bypass system routes
  if (IGNORED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 1. Strip defaultLocale prefix from URL: /en-US/signin -> /signin, /en-US -> /
  if (pathname === `/${defaultLocale}`) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith(`/${defaultLocale}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || '/';
    return NextResponse.redirect(url);
  }

  // 2. Allow non-default locales with prefix through: /vi-VN/..., /ar-TN/...
  const nonDefaultLocale = supportedLocales.find(
    (loc) => loc !== defaultLocale && (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`)
  );
  if (nonDefaultLocale) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-locale', nonDefaultLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. For routes without locale prefix:
  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const resolvedLocale = normalizeLocale(cookieLocale || defaultLocale);

  // If user preferred a non-default locale (e.g. vi-VN), redirect to /vi-VN{pathname}
  if (resolvedLocale !== defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${resolvedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Default locale: rewrite internally to /[defaultLocale]{pathname} so App Router routes match
  // but keep the URL clean in browser address bar (e.g. /signin, /signup)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-locale', defaultLocale);
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
