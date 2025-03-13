"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"

const publicRoutes = ["/login", "/register"]

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()

  useEffect(() => {
    // 如果用户未登录且不在公开路由中，重定向到登录页
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
    // 如果用户已登录且在登录/注册页，重定向到首页
    if (user && publicRoutes.includes(pathname)) {
      router.push("/")
    }
  }, [user, pathname, router])

  // 在公开路由或用户已登录时渲染内容
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>
  }

  // 加载状态
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
} 