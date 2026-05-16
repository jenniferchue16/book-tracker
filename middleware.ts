import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('book-tracker-session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authed = await isAuthenticated(request)

  // Authenticated users visiting /auth → redirect to library
  if (pathname === '/auth' && authed) {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  // Protected routes: /library and /api/books
  const isProtected =
    pathname.startsWith('/library') || pathname.startsWith('/api/books')

  if (isProtected && !authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth', '/library/:path*', '/api/books/:path*'],
}
