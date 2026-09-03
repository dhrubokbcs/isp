import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export async function proxy(req: NextRequest) {
  // 1. Refresh Supabase session and sync cookies
  const { supabaseResponse } = await updateSession(req);

  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 2. Detect console subdomain (e.g. console.ispctg.live, console.localhost:3000)
  const isConsoleSubdomain =
    hostname.startsWith('console.') ||
    hostname.startsWith('console:');

  if (isConsoleSubdomain) {
    // A. If accessing root "/" on console subdomain, redirect cleanly to "/login"
    if (url.pathname === '/' || url.pathname === '') {
      const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }

    // B. If accessing "/console/login", redirect cleanly to "/login"
    if (url.pathname === '/console/login') {
      const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }

    // C. Internal route mapping for console subdomain:
    let internalPath = url.pathname;

    // /login -> routes internally to /console/login (Browser URL stays http://console.localhost:3000/login)
    if (url.pathname === '/login') {
      internalPath = '/console/login';
    }
    // /admin/* -> routes internally to /console/admin/* (Browser URL stays http://console.localhost:3000/admin/...)
    else if (url.pathname.startsWith('/admin')) {
      internalPath = `/console${url.pathname}`;
    }
    // /teacher/* -> routes internally to /console/teacher/* (Browser URL stays http://console.localhost:3000/teacher/...)
    else if (url.pathname.startsWith('/teacher')) {
      internalPath = `/console${url.pathname}`;
    }
    // Any other subpath without /console prefix
    else if (!url.pathname.startsWith('/console')) {
      internalPath = `/console${url.pathname}`;
    }

    const rewriteUrl = new URL(internalPath, req.url);
    const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: req.headers,
      },
    });

    // Preserve Supabase session cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie);
    });

    return rewriteResponse;
  }

  // 3. If someone on root domain tries to access /admin, /teacher, or /console, redirect to console subdomain
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/console')
  ) {
    const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
    const cleanHost = hostname.split(':')[0].replace(/^www\./, '');
    const consoleHost = `console.${cleanHost}${port}`;
    const targetPath = url.pathname.replace(/^\/console/, '') || '/login';

    const redirectResponse = NextResponse.redirect(
      new URL(targetPath, `${url.protocol}//${consoleHost}`)
    );
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}
