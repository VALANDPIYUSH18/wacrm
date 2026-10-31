import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/dashboard';
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return '/dashboard';
  }
  return path;
}

function getRedirectBase(request: Request, origin: string): string {
  const isLocalEnv = process.env.NODE_ENV === 'development';
  if (isLocalEnv) return origin;

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !explicit.includes('example.com')) {
    return explicit.replace(/\/+$/, '');
  }

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const rawAllowed = process.env.ALLOWED_INVITE_HOSTS?.trim();
  const allowList = rawAllowed
    ? rawAllowed.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
    : null;

  if (forwardedHost) {
    if (!allowList || allowList.includes(forwardedHost.toLowerCase())) {
      const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
      return `${forwardedProto}://${forwardedHost}`;
    }
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const targetPath = sanitizeRedirectPath(searchParams.get('next'));
  const redirectBase = getRedirectBase(request, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${targetPath}`);
    }
    console.error('[auth/callback] Code exchange error:', error);
  }

  // If code is missing or invalid, redirect to login with error
  return NextResponse.redirect(`${redirectBase}/login?error=Invalid+or+expired+confirmation+link`);
}
