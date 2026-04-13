import { NextResponse } from 'next/server';

/** Comma-separated public IPs allowed to use the site. Unset = open to everyone. */
function parseAllowlist(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const ips = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ips.length ? ips : null;
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp ? realIp.trim() : '';
}

function normalizeIp(ip) {
  if (!ip) return '';
  const lower = ip.toLowerCase();
  if (lower.startsWith('::ffff:')) return lower.slice(7);
  return lower;
}

function isAllowedIp(clientIp, allowlist) {
  const c = normalizeIp(clientIp);
  return allowlist.some((allowed) => normalizeIp(allowed) === c);
}

export function middleware(request) {
  const allowlist = parseAllowlist(process.env.ALLOWED_IPS);
  if (!allowlist) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);

  const host = (request.headers.get('host') || '').toLowerCase();
  const isLocalHost =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]');

  // `next dev` / `next start` on this machine often have no x-forwarded-for.
  if (!clientIp && (process.env.NODE_ENV === 'development' || isLocalHost)) {
    return NextResponse.next();
  }

  if (clientIp && isAllowedIp(clientIp, allowlist)) {
    return NextResponse.next();
  }

  const isApi = request.nextUrl.pathname.startsWith('/api');
  if (isApi) {
    return NextResponse.json({ error: 'Forbidden', message: 'IP not allowlisted' }, { status: 403 });
  }

  return new NextResponse(
    'Akses ditolak. / Access denied. (IP not allowlisted)',
    { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
