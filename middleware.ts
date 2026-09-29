import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL('/account', request.url));
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies: Array<{ name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }>) => { cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/account', request.url));
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['admin', 'editor', 'moderator'].includes(profile.role)) return NextResponse.redirect(new URL('/', request.url));
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
