import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Runs only for /admin. Keeps the login session fresh and sends
// logged-out visitors to the login page. Admin rights are checked again
// on the server for every page and action, so if anything here fails we
// let the request through and the page decides (never a 500).
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Keys missing (e.g. not set in Vercel): the admin pages show a setup message.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const isLogin = request.nextUrl.pathname.startsWith('/admin/login');

    if (!user && !isLogin) {
      const to = request.nextUrl.clone();
      to.pathname = '/admin/login/';
      to.search = '';
      return NextResponse.redirect(to);
    }
    if (user && isLogin) {
      const to = request.nextUrl.clone();
      to.pathname = '/admin/';
      return NextResponse.redirect(to);
    }
  } catch (err) {
    console.error('[middleware] Supabase session check failed:', (err as Error).message);
  }
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
