import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 暂时禁用认证检查，等登录页面开发完成后再启用
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由除了:
     * - api 路由
     * - 静态文件
     * - _next 系统文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 