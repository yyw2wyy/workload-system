"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"

const navigation = [
  { name: "首页", href: "/" },
  { name: "工作量管理", href: "/workload" },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  // 如果用户未登录，不显示导航栏
  if (!user) return null

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
      {/* 顶部Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold">工作量系统</span>
      </div>

      {/* 用户信息 */}
      <div className="px-6 py-4 border-b">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {user.username}
          </div>
          <div className="text-xs text-muted-foreground">
            角色：{user.role}
          </div>
          <button
            onClick={() => logout()}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            退出
          </button>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 