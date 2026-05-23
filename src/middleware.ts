import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isLoginPage = nextUrl.pathname === '/login'
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth')
  const isPublic = isLoginPage || isApiAuth

  // 미인증 → /login 리다이렉트
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', nextUrl.origin))
  }

  // 인증 완료 상태에서 /login 접근 → /dashboard 리다이렉트
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  // 관리자 전용 경로: /settings
  if (nextUrl.pathname.startsWith('/settings') && req.auth?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
